import {DepositTree} from "../../src/db/repositories/depositDataRoot";
import {phase0, ssz} from "@lodestar/types";
import {deterministicDeposits} from "../../src/node/utils/interop/deposits.js";
import {initDeterministicStateFromDepositData } from "../../lib/node/utils/state.js";
import {chainConfigFromJson, createIChainForkConfig, IChainConfig} from "@lodestar/config";
import {BranchNodeStruct} from "@chainsafe/ssz/lib/branchNodeStruct";
import {expect} from "chai";
import {fromHexString, toHexString} from "@chainsafe/ssz";
import {InteropStateOpts} from "../../src/node/utils/interop/state";
import {readFileSync} from "node:fs";
import {BeaconStateExecutions} from "@lodestar/state-transition/src/cache/types";
import fs from "fs";
import {IBeaconParamsUnparsed} from "@chainsafe/lodestar/src/config/types";
import {readFile} from "../../../cli/src/util/index.js";

import executionGenesisJSON from "./fixtures/genesis.json" assert { type: "json" };
import {Common} from "@ethereumjs/common";
import {Block, BlockHeader} from "@ethereumjs/block";

const chainConfigFilePath = "./test/utils/fixtures/config.yaml"
const luksoDevnet3030ChainConfig: IChainConfig = chainConfigFromJson(readBeaconParams(chainConfigFilePath));

type QUANTITY = string;

const bellatrixGenesisBlockStateRoot = "0x3e6dbade337e3d23e3ca780fa839ef273d78bde6a478127fd3cc4086d1077c4e";
const genesisBlockHash = process.argv[2];


const common = Common.fromGethGenesis(executionGenesisJSON, {
    hardfork: 'merge',
    chain: 'customChain',
})

const block = Block.fromBlockData(
    {
        header: BlockHeader.fromHeaderData({
            difficulty: quantityToNum(executionGenesisJSON.difficulty),
            timestamp: quantityToNum(executionGenesisJSON.timestamp),
            gasLimit: quantityToNum(executionGenesisJSON.gasLimit),
            extraData: fromHexString(executionGenesisJSON.extraData),
            transactionsTrie: ssz.bellatrix.Transactions.hashTreeRoot([]),
            stateRoot: fromHexString(bellatrixGenesisBlockStateRoot)
        }, { common, skipConsensusFormatValidation: false }),
    },
    { common, skipConsensusFormatValidation: false }
)

const devnet3030StateOps: InteropStateOpts = {
    genesisTime: luksoDevnet3030ChainConfig.MIN_GENESIS_TIME + luksoDevnet3030ChainConfig.GENESIS_DELAY,
    eth1BlockHash: fromHexString(genesisBlockHash),
    eth1Timestamp: quantityToNum(executionGenesisJSON.timestamp),
    extraData: fromHexString(executionGenesisJSON.extraData),
    gasLimit: quantityToNum(executionGenesisJSON.gasLimit),
    receiptsRoot: fromHexString(`0x` + block.header.receiptTrie.toString("hex")),
    stateRoot: fromHexString(bellatrixGenesisBlockStateRoot),
    transactionsRoot: ssz.bellatrix.Transactions.hashTreeRoot([])
}

const depositDataDevnet3030 = readFileSync('./test/utils/fixtures/deposit_data.json', 'utf-8')

const depositTree: DepositTree = ssz.phase0.DepositDataRootList.defaultViewDU();
const depositDataJsonArray = JSON.parse(depositDataDevnet3030);
const depositDataArray: phase0.DepositData[] = [];

for (let i = 0; i < depositDataJsonArray.length; i++) {
    const depositData: phase0.DepositData = ssz.phase0.DepositData.fromJson(depositDataJsonArray[i]);
    depositDataArray.push(depositData);
}

const deterministicDepositsList = deterministicDeposits(luksoDevnet3030ChainConfig, depositTree, depositDataArray);

const {state, deposits} = initDeterministicStateFromDepositData(
    createIChainForkConfig(luksoDevnet3030ChainConfig),
    deterministicDepositsList,
    devnet3030StateOps,
    depositTree,
);

const validatorNodes = state["validators"]["nodes"];
validatorNodes.forEach((node, i) => {
    const currentValidator: BranchNodeStruct<any> = node as BranchNodeStruct<any>;
    expect(deposits[i].data).to.be.deep.equal(depositDataArray[i]);
    expect(toHexString(currentValidator.value.pubkey)).to.be.equal(toHexString(depositDataArray[i].pubkey));
    expect(currentValidator.value.effectiveBalance).to.be.equal(depositDataArray[i].amount);
    expect(currentValidator.value.withdrawalCredentials).to.be.equal(depositDataArray[i].withdrawalCredentials);
});

const executionState: BeaconStateExecutions = state as BeaconStateExecutions;
const executionTypeState = ssz.bellatrix.BeaconState.toJson(executionState.toValue());
const executionTypeStateSsz = ssz.bellatrix.BeaconState.serialize(executionState.toValue());
const serializedJson = JSON.stringify(executionTypeState, null, 2);

fs.writeFileSync('./genesis_ssz.json', serializedJson);
fs.writeFileSync('./genesis.ssz', executionTypeStateSsz);

function quantityToNum(hex: QUANTITY, id = ""): number {
    const num = parseInt(hex, 16);
    if (isNaN(num) || num < 0) throw Error(`Invalid hex decimal ${id} '${hex}'`);
    return num;
}

function readBeaconParams(filepath: string): IBeaconParamsUnparsed {
    return readFile(filepath) ?? {};
}
