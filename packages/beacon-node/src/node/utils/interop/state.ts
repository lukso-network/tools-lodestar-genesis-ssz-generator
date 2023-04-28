import {Bytes32, phase0, ssz, TimeSeconds, UintNum64} from "@lodestar/types";
import {IChainForkConfig} from "@lodestar/config";
import {BeaconStateAllForks, initializeBeaconStateFromEth1} from "@lodestar/state-transition";
import {createEmptyEpochContextImmutableData} from "@lodestar/state-transition";
import {ForkName, GENESIS_SLOT, MAX_EXTRA_DATA_BYTES} from "@lodestar/params";

import {DepositTree} from "../../../db/repositories/depositDataRoot.js";
import {ByteListType} from "@chainsafe/ssz/lib/type/byteList";
import {fromHexString} from "@chainsafe/ssz";

export const INTEROP_BLOCK_HASH = Buffer.alloc(32, "B");
export const INTEROP_TIMESTAMP = Math.pow(2, 40);
// Genesis testing settings (spec v1.0.1)
// Note: These configuration settings do not apply to the mainnet and are utilized only by pure Merge testing.
export const GENESIS_GAS_LIMIT = 80000000;
export const GENESIS_BASE_FEE_PER_GAS = BigInt(1000000000);
type ExecutionFork = Exclude<ForkName, ForkName.phase0 | ForkName.altair>;

export type InteropStateOpts = {
  genesisTime?: number;
  eth1BlockHash?: Bytes32;
  eth1Timestamp?: TimeSeconds;
  withEth1Credentials?: boolean;
  gasLimit?: UintNum64;
  extraData?: Uint8Array;
  blockNumber?: number;
  gasUsed?: UintNum64;
  baseFeePerGas?: bigint;
  // Difficulty is/should be used to set prevRandao and comes from genesis.json.
  difficulty?: Uint8Array;
  receiptsRoot?: Uint8Array,
  stateRoot?: Uint8Array,
  transactionsRoot?: Uint8Array,
  eth1Data?: phase0.Eth1Data,
};

export function getInteropState(
  config: IChainForkConfig,
  {
    genesisTime = Math.floor(Date.now() / 1000),
    eth1BlockHash = INTEROP_BLOCK_HASH,
    eth1Timestamp = INTEROP_TIMESTAMP,
    gasLimit = GENESIS_GAS_LIMIT,
    extraData,
    blockNumber = 0,
    gasUsed = 0,
    baseFeePerGas = GENESIS_BASE_FEE_PER_GAS,
    difficulty,
    receiptsRoot,
    stateRoot,
    transactionsRoot,
    eth1Data,
  }: InteropStateOpts,
  deposits: phase0.Deposit[],
  fullDepositDataRootList?: DepositTree
): BeaconStateAllForks {
  const fork = config.getForkName(GENESIS_SLOT);

  const executionPayloadHeaderType =
    fork !== ForkName.phase0 && fork !== ForkName.altair
      ? ssz.allForksExecution[fork as ExecutionFork].ExecutionPayloadHeader
      : ssz.bellatrix.ExecutionPayloadHeader;
  let latestPayloadHeader = executionPayloadHeaderType.defaultViewDU();
  // TODO: when having different test options, consider modifying these values
  latestPayloadHeader.blockHash = eth1BlockHash;
  latestPayloadHeader.timestamp = eth1Timestamp;
  latestPayloadHeader.prevRandao = Buffer.alloc(32, 0);

 if ('undefined' !== typeof gasLimit) {
     latestPayloadHeader.gasLimit = gasLimit;
 }

  if ('undefined' !== typeof extraData) {
    latestPayloadHeader.extraData = extraData;
  }

  if ('undefined' != typeof difficulty) {
    latestPayloadHeader.prevRandao = difficulty;
  }

  if ('undefined' != typeof receiptsRoot) {
    latestPayloadHeader.receiptsRoot = receiptsRoot;
  }

  if ('undefined' != typeof stateRoot) {
    latestPayloadHeader.stateRoot = stateRoot;
  }

  if ('undefined' != typeof transactionsRoot) {
    latestPayloadHeader.transactionsRoot = transactionsRoot;
  }

  latestPayloadHeader.blockNumber = blockNumber;
  latestPayloadHeader.gasUsed = gasUsed;
  latestPayloadHeader.baseFeePerGas = baseFeePerGas;
  latestPayloadHeader.baseFeePerGas = GENESIS_BASE_FEE_PER_GAS;
  const state = initializeBeaconStateFromEth1(
    config,
    createEmptyEpochContextImmutableData(config, {genesisValidatorsRoot: Buffer.alloc(32, 0)}),
    eth1BlockHash,
    eth1Timestamp,
    deposits,
    fullDepositDataRootList,
    latestPayloadHeader
  );
  state.genesisTime = genesisTime;
  // Because of Bellatrix - PoS network from genesis, we need to set index to 0
  state.eth1DepositIndex = 0;
  state.commit()
  return state;
}
