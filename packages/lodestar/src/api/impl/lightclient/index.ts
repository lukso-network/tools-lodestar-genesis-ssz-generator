import {altair, ssz} from "@chainsafe/lodestar-types";
import {ApiModules} from "../types";
import {resolveStateId} from "../beacon/state/utils";
import {routes} from "@chainsafe/lodestar-api";
import {linspace} from "../../../util/numpy";
import {fromHexString, isCompositeType} from "@chainsafe/ssz";
import {ProofType} from "@chainsafe/persistent-merkle-tree";
import {IApiOptions} from "../../options";

// TODO: Import from lightclient/server package

export function getLightclientApi(
  opts: IApiOptions,
  {chain, config, db}: Pick<ApiModules, "chain" | "config" | "db">
): routes.lightclient.Api {
  // It's currently possible to request gigantic proofs (eg: a proof of the entire beacon state)
  // We want some some sort of resistance against this DoS vector.
  const maxGindicesInProof = opts.maxGindicesInProof ?? 512;

  return {
    async getStateProof(stateId, paths) {
      const state = await resolveStateId(config, chain, db, stateId);
      const stateTreeBacked = ssz.altair.BeaconState.createTreeBackedFromStruct(state as altair.BeaconState);
      const tree = stateTreeBacked.tree;

      const gindicesSet = new Set<bigint>();

      for (const path of paths) {
        // Logic from TreeBacked#createProof is (mostly) copied here to expose the # of gindices in the proof
        const {type, gindex} = ssz.altair.BeaconState.getPathInfo(path);
        if (!isCompositeType(type)) {
          gindicesSet.add(gindex);
        } else {
          // if the path subtype is composite, include the gindices of all the leaves
          const gindexes = type.tree_getLeafGindices(
            type.hasVariableSerializedLength() ? tree.getSubtree(gindex) : undefined,
            gindex
          );
          for (const gindex of gindexes) {
            gindicesSet.add(gindex);
          }
        }
      }

      if (gindicesSet.size > maxGindicesInProof) {
        throw new Error("Requested proof is too large.");
      }

      return {
        data: tree.getProof({
          type: ProofType.treeOffset,
          gindices: Array.from(gindicesSet),
        }),
      };
    },

    async getCommitteeUpdates(from, to) {
      const periods = linspace(from, to);
      const updates = await Promise.all(
        periods.map((period) => chain.lightClientServer.serveBestUpdateInPeriod(period))
      );
      return {data: updates};
    },

    async getSnapshot(blockRoot) {
      const snapshotProof = await chain.lightClientServer.serveInitCommittees(fromHexString(blockRoot));
      return {data: snapshotProof};
    },
  };
}
