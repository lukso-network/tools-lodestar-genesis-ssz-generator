import {expect} from "chai";
import {fromHexString, toHexString} from "@chainsafe/ssz";
import {config} from "@lodestar/config/default";
import {phase0, ssz} from "@lodestar/types";
import {deterministicDeposits, interopDeposits} from "../../../src/node/utils/interop/deposits.js";
import {InteropStateOpts} from "../../../src/node/utils/interop/state";
import {DepositTree} from "../../../src/db/repositories/depositDataRoot";
import {PresetName} from "@lodestar/params";
import {chainConfigFromJson, createIChainForkConfig, IChainConfig} from "@lodestar/config";
import {BranchNodeStruct} from "@chainsafe/ssz/lib/branchNodeStruct";
import {BeaconStateExecutions} from "@lodestar/state-transition/src/cache/types";
import * as fs from "fs";
import {readFileSync} from "node:fs";
import {initDeterministicStateFromDepositData, initDevState } from "../../../lib/node/utils/state.js";
import {IBeaconParamsUnparsed} from "@chainsafe/lodestar/src/config/types";
import {readFile} from "../../../../cli/src/util/index.js";
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { Block, BlockHeader } from '@ethereumjs/block';
import { intToHex, isHexPrefixed, stripHexPrefix, toBuffer } from '@ethereumjs/util';

import executionGenesisJSON from "./fixtures/genesis.json" assert { type: "json" };
const chainConfigFilePath = "./test/e2e/interop/fixtures/config.yaml"
const luksoDevnet3030ChainConfig: IChainConfig = chainConfigFromJson(readBeaconParams(chainConfigFilePath));

type QUANTITY = string;
type ConfigHardfork =
    | { name: string; block: null; timestamp: number }
    | { name: string; block: number; timestamp?: number }

const common = Common.fromGethGenesis(executionGenesisJSON, {
  hardfork: 'merge',
  chain: 'customChain',
})

const loadedBlock = Block.fromBlockData(
    {
    },
    { common, skipConsensusFormatValidation: false }
)

const block = Block.fromBlockData(
    {
      header: BlockHeader.fromHeaderData({
        difficulty: quantityToNum(executionGenesisJSON.difficulty),
        timestamp: quantityToNum(executionGenesisJSON.timestamp),
        gasLimit: quantityToNum(executionGenesisJSON.gasLimit),
        extraData: fromHexString(executionGenesisJSON.extraData),
        receiptTrie: fromHexString("0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421"),
        transactionsTrie: ssz.bellatrix.Transactions.hashTreeRoot([]),
        stateRoot: fromHexString("0xadb47a26e2b0b77af63ef3d9d8304c5545005144501f900c48f8ba5be27f91e9")
      }, { common, skipConsensusFormatValidation: false }),
    },
    { common, skipConsensusFormatValidation: false }
)

console.log("Block hash: ", block.hash().toString("hex"));

const devnet3030StateOps: InteropStateOpts = {
  genesisTime: luksoDevnet3030ChainConfig.MIN_GENESIS_TIME + luksoDevnet3030ChainConfig.GENESIS_DELAY,
  eth1BlockHash: fromHexString('0xdcecdff3abf41b6a13f73659bd875bcb52b6fb156c6c105da039d98650919384'),
  eth1Timestamp: quantityToNum(executionGenesisJSON.timestamp),
  extraData: fromHexString(executionGenesisJSON.extraData),
  gasLimit: quantityToNum(executionGenesisJSON.gasLimit),
  receiptsRoot: fromHexString(`0x` + block.header.receiptTrie.toString("hex")),
  stateRoot: fromHexString("0xadb47a26e2b0b77af63ef3d9d8304c5545005144501f900c48f8ba5be27f91e9"),
  transactionsRoot: ssz.bellatrix.Transactions.hashTreeRoot([])
}

describe("interop / initDevState", () => {
  it("Create interop deposits", () => {
    const deposits = interopDeposits(config, ssz.phase0.DepositDataRootList.defaultViewDU(), 1);

    /* eslint-disable @typescript-eslint/naming-convention */
    expect(deposits.map((deposit) => ssz.phase0.Deposit.toJson(deposit))).to.deep.equal([
      {
        proof: [
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0xf5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b",
          "0xdb56114e00fdd4c1f85c892bf35ac9a89289aaecb1ebd0a96cde606a748b5d71",
          "0xc78009fdf07fc56a11f122370658a353aaa542ed63e44c4bc15ff4cd105ab33c",
          "0x536d98837f2dd165a55d5eeae91485954472d56f246df256bf3cae19352a123c",
          "0x9efde052aa15429fae05bad4d0b1d7c64da64d03d7a1854a588c2cb8430c0d30",
          "0xd88ddfeed400a8755596b21942c1497e114c302e6118290f91e6772976041fa1",
          "0x87eb0ddba57e35f6d286673802a4af5975e22506c7cf4c64bb6be5ee11527f2c",
          "0x26846476fd5fc54a5d43385167c95144f2643f533cc85bb9d16b782f8d7db193",
          "0x506d86582d252405b840018792cad2bf1259f1ef5aa5f887e13cb2f0094f51e1",
          "0xffff0ad7e659772f9534c195c815efc4014ef1e1daed4404c06385d11192e92b",
          "0x6cf04127db05441cd833107a52be852868890e4317e6a02ab47683aa75964220",
          "0xb7d05f875f140027ef5118a2247bbb84ce8f2f0f1123623085daf7960c329f5f",
          "0xdf6af5f5bbdb6be9ef8aa618e4bf8073960867171e29676f8b284dea6a08a85e",
          "0xb58d900f5e182e3c50ef74969ea16c7726c549757cc23523c369587da7293784",
          "0xd49a7502ffcfb0340b1d7885688500ca308161a7f96b62df9d083b71fcc8f2bb",
          "0x8fe6b1689256c0d385f42f5bbe2027a22c1996e110ba97c171d3e5948de92beb",
          "0x8d0d63c39ebade8509e0ae3c9c3876fb5fa112be18f905ecacfecb92057603ab",
          "0x95eec8b2e541cad4e91de38385f2e046619f54496c2382cb6cacd5b98c26f5a4",
          "0xf893e908917775b62bff23294dbbe3a1cd8e6cc1c35b4801887b646a6f81f17f",
          "0xcddba7b592e3133393c16194fac7431abf2f5485ed711db282183c819e08ebaa",
          "0x8a8d7fe3af8caa085a7639a832001457dfb9128a8061142ad0335629ff23ff9c",
          "0xfeb3c337d7a51a6fbf00b9e34c52e1c9195c969bd4e7a0bfd51d5c5bed9c1167",
          "0xe71f0aa83cc32edfbefa9f4d3e0174ca85182eec9f3a09f6a6c0df6377a510d7",
          "0x31206fa80a50bb6abe29085058f16212212a60eec8f049fecb92d8c8e0a84bc0",
          "0x21352bfecbeddde993839f614c3dac0a3ee37543f9b412b16199dc158e23b544",
          "0x619e312724bb6d7c3153ed9de791d764a366b389af13c58bf8a8d90481a46765",
          "0x7cdd2986268250628d0c10e385c58c6191e6fbe05191bcc04f133f2cea72c1c4",
          "0x848930bd7ba8cac54661072113fb278869e07bb8587f91392933374d017bcbe1",
          "0x8869ff2c22b28cc10510d9853292803328be4fb0e80495e8bb8d271f5b889636",
          "0xb5fe28e79f1b850f8658246ce9b6a1e7b49fc06db7143e8fe0b4f2b0c5523a5c",
          "0x985e929f70af28d0bdd1a90a808f977f597c7c778c489e98d3bd8910d31ac0f7",
          "0x0100000000000000000000000000000000000000000000000000000000000000",
        ],
        data: {
          pubkey: "0xa99a76ed7796f7be22d5b7e85deeb7c5677e88e511e0b337618f8c4eb61349b4bf2d153f649f7b53359fe8b94a38e44c",
          withdrawal_credentials: "0x00fad2a6bfb0e7f1f0f45460944fbd8dfa7f37da06a4d13b3983cc90bb46963b",
          amount: "32000000000",
          signature:
            "0xa9ac65fdd32e9ea916127b5c307a4abde9bde12e751f372c5f0aa84f62f09eba673b25949673c5c5d01527ecff90205e02389d709a74715b5f3f30d3defd0fc559e9480eae522463d7c9e6b77649132ba1fa3b4b33f7b1f471d22829df9f9416",
        },
      },
    ]);
  });

  it("Create correct genesisState", () => {
    const chainConfig = createIChainForkConfig(luksoDevnet3030ChainConfig);
    const validatorCount = 112;
    const {state} = initDevState(chainConfig, validatorCount, devnet3030StateOps);

    expect(toHexString(state.hashTreeRoot())).to.equal(
      "0xa32222d1036367fd71f454cdaad354071ae6b61bf03e841bc807bce9969f6695",
      "Wrong genesis state root"
    );
  });

  it("Create correct POS bellatrix state from genesis, benchmark devnet3030", () => {
    const depositTree: DepositTree = ssz.phase0.DepositDataRootList.defaultViewDU();
    const depositDataJsonArray = JSON.parse(depositData120ValidatorsDevnet3030);
    const depositDataList: phase0.DepositData[] = [];
    for (let i = 0; i < depositDataJsonArray.length; i++) {
      const depositData: phase0.DepositData = ssz.phase0.DepositData.fromJson(depositDataJsonArray[i]);
      depositDataList.push(depositData);
    }

    const deterministicDepositsList = deterministicDeposits(luksoDevnet3030ChainConfig, depositTree, depositDataList);
    expect(deterministicDepositsList.length).to.be.equal(depositDataList.length);

    const {state, deposits} = initDeterministicStateFromDepositData(
        createIChainForkConfig(luksoDevnet3030ChainConfig),
        deterministicDepositsList,
        devnet3030StateOps,
        depositTree,
    );

    expect(deposits.length).to.be.equal(depositDataList.length);

    // Bypass the assertion to check other stuff
    expect(toHexString(state["genesisValidatorsRoot"])).to.be.equal(
        "0xae272d8a25bceac672974985292a54795afc510bd7e4e368a7ec74e4cdfeb191",
        "wrong genesis validators root",
    );

    expect(toHexString(state["eth1Data"].blockHash)).to.be.equal(
        "0xdcecdff3abf41b6a13f73659bd875bcb52b6fb156c6c105da039d98650919384",
        "Wrong eth1Data block hash",
    );

    // Bypass the assertion to check other stuff
    expect(toHexString(state["eth1Data"].depositRoot)).to.be.equal(
        "0x5ccfbbad31a24b172d86e872bc958cdf6d40866f367a3cec2457730ea4f20cb8",
        "Wrong eth1Data deposit root",
    );

    expect(state["eth1DepositIndex"]).to.be.equal(
        0,
        "Wrong state eth1Data deposit index",
    );

    // Check that validators has corresponding keys from the input file
    expect(state["validators"].length).to.be.equal(depositDataList.length);
    const validatorNodes = state["validators"]["nodes"];
    validatorNodes.forEach((node, i) => {
      const currentValidator: BranchNodeStruct<any> = node as BranchNodeStruct<any>;
      expect(deposits[i].data).to.be.deep.equal(depositDataList[i]);
      expect(toHexString(currentValidator.value.pubkey)).to.be.equal(toHexString(depositDataList[i].pubkey));
      expect(currentValidator.value.effectiveBalance).to.be.equal(depositDataList[i].amount);
      expect(currentValidator.value.withdrawalCredentials).to.be.equal(depositDataList[i].withdrawalCredentials);
    });

    const executionState: BeaconStateExecutions = state as BeaconStateExecutions;

    expect(executionState.eth1DepositIndex).to.be.equal(
        0,
        "Wrong executionState eth1Data deposit index",
    );

    const executionTypeStateSsz = ssz.bellatrix.BeaconState.toJson(executionState.toValue());
    const stateSsz = ssz.bellatrix.BeaconState.serialize(executionState.toValue());

    expect(executionTypeStateSsz["eth1_deposit_index"]).to.be.equal(
        "0",
        "Wrong executionTypeStateSsz eth1Data deposit index",
    );

    // FOR SPIKE AND DEBUGGING PURPOSES! TODO: REMOVE THAT
    const serializedJson = JSON.stringify(executionTypeStateSsz, null, 2);

    fs.writeFileSync('./devnet3030_genesis_from_loadstar_generator.json', serializedJson);

    fs.writeFileSync('./genesis.ssz', stateSsz);

    const expectedJsonOutput = JSON.parse(generatedGenesisCLDevnet3030_ETH2_VAL_TOOLS);
    expect(executionTypeStateSsz.genesis_time).to.deep.equal(expectedJsonOutput.genesis_time);
    expect(executionTypeStateSsz.genesis_validators_root).to.deep.equal(expectedJsonOutput.genesis_validators_root);
    expect(executionTypeStateSsz.slot).to.deep.equal(expectedJsonOutput.slot);
    expect(executionTypeStateSsz.fork).to.deep.equal(expectedJsonOutput.fork);
    expect(executionTypeStateSsz.latest_block_header).to.deep.equal(expectedJsonOutput.latest_block_header);
    expect(executionTypeStateSsz.block_roots).to.deep.equal(expectedJsonOutput.block_roots);
    expect(executionTypeStateSsz.historical_roots).to.deep.equal(expectedJsonOutput.historical_roots);
    // It won't equal, because we are generating proper deposit_root, not default for `phase0` like eth2-testnet-genesis does
    // expect(executionTypeStateSsz.eth1_data).to.deep.equal(expectedJsonOutput.eth1_data);
    expect(executionTypeStateSsz.eth1_data_votes).to.deep.equal(expectedJsonOutput.eth1_data_votes);
    expect(executionTypeStateSsz.eth1_deposit_index).to.deep.equal(expectedJsonOutput.eth1_deposit_index);

    // Validators checks, the strutcs are not deep equal, because of mismatch: amount and value
    executionState.validators.toValue().forEach((validator, i) => {
      // @ts-ignore
      const currentValidator = executionTypeStateSsz.validators[i];
      const expectedValidator = expectedJsonOutput.validators[i];
      expect(currentValidator['activation_eligibility_epoch']).
        to.deep.equal(expectedValidator['activation_eligibility_epoch']);
      expect(currentValidator['activation_epoch']).
        to.deep.equal(expectedValidator['activation_epoch']);
      expect(currentValidator['effective_balance']).
        to.deep.equal(expectedValidator['effective_balance']);
      expect(currentValidator['exit_epoch']).
        to.deep.equal(expectedValidator['exit_epoch']);
      expect(currentValidator['pubkey']).
        to.deep.equal(expectedValidator['pubkey']);
      expect(currentValidator['slashed']).
        to.deep.equal(expectedValidator['slashed']);
      expect(currentValidator['withdrawable_epoch']).
        to.deep.equal(expectedValidator['withdrawable_epoch']);
    });
    expect(executionTypeStateSsz.balances).to.deep.equal(expectedJsonOutput.balances);
    expect(executionTypeStateSsz.randao_mixes).to.deep.equal(expectedJsonOutput.randao_mixes);
    expect(executionTypeStateSsz.slashings).to.deep.equal(expectedJsonOutput.slashings);
    // expect(executionTypeStateSsz.current_sync_committee).to.deep.equal(expectedJsonOutput.current_sync_committee);
    // expect(executionTypeStateSsz.next_sync_committee).to.deep.equal(expectedJsonOutput.next_sync_committee);
    expect(executionTypeStateSsz.latest_execution_payload_header).to.deep.equal(expectedJsonOutput.latest_execution_payload_header);

    // expect(toHexString(state.hashTreeRoot())).to.equal(
    //     "0xdaf9ee712a0de7ce2b5e0e6c7623085b6d22dfaf7423cbc6e3d7f6fc79ad73e1",
    //     "Wrong genesis state root"
    // );
  });
});

function quantityToNum(hex: QUANTITY, id = ""): number {
  const num = parseInt(hex, 16);
  if (isNaN(num) || num < 0) throw Error(`Invalid hex decimal ${id} '${hex}'`);
  return num;
}

function readBeaconParams(filepath: string): IBeaconParamsUnparsed {
  return readFile(filepath) ?? {};
}

/**
 * Transforms Geth formatted nonce (i.e. hex string) to 8 byte 0x-prefixed string used internally
 * @param nonce string parsed from the Geth genesis file
 * @returns nonce as a 0x-prefixed 8 byte string
 */
function formatNonce(nonce: string): string {
  if (!nonce || nonce === '0x0') {
    return '0x0000000000000000'
  }
  if (isHexPrefixed(nonce)) {
    return '0x' + stripHexPrefix(nonce).padStart(16, '0')
  }
  return '0x' + nonce.padStart(16, '0')
}

/**
 * Converts Geth genesis parameters to an EthereumJS compatible `CommonOpts` object
 * @param json object representing the Geth genesis file
 * @param optional mergeForkIdPostMerge which clarifies the placement of MergeForkIdTransition
 * hardfork, which by default is post merge as with the merged eth networks but could also come
 * before merge like in kiln genesis
 * @returns genesis parameters in a `CommonOpts` compliant object
 */
function parseGethParams(json: any, mergeForkIdPostMerge: boolean = true) {
  const {
    name,
    config,
    difficulty,
    mixHash,
    gasLimit,
    coinbase,
    baseFeePerGas,
  }: {
    name: string
    config: any
    difficulty: string
    mixHash: string
    gasLimit: string
    coinbase: string
    baseFeePerGas: string
  } = json
  let { extraData, timestamp, nonce }: { extraData: string; timestamp: string; nonce: string } =
      json
  const genesisTimestamp = Number(timestamp)
  const { chainId }: { chainId: number } = config

  // geth is not strictly putting empty fields with a 0x prefix
  if (extraData === '') {
    extraData = '0x'
  }
  // geth may use number for timestamp
  if (!isHexPrefixed(timestamp)) {
    timestamp = intToHex(parseInt(timestamp))
  }
  // geth may not give us a nonce strictly formatted to an 8 byte hex string
  if (nonce.length !== 18) {
    nonce = formatNonce(nonce)
  }

  // EIP155 and EIP158 are both part of Spurious Dragon hardfork and must occur at the same time
  // but have different configuration parameters in geth genesis parameters
  if (config.eip155Block !== config.eip158Block) {
    throw new Error(
        'EIP155 block number must equal EIP 158 block number since both are part of SpuriousDragon hardfork and the client only supports activating the full hardfork'
    )
  }

  const params = {
    name,
    chainId,
    networkId: chainId,
    genesis: {
      timestamp,
      gasLimit: parseInt(gasLimit), // geth gasLimit and difficulty are hex strings while ours are `number`s
      difficulty: parseInt(difficulty),
      nonce,
      extraData,
      mixHash,
      coinbase,
      baseFeePerGas,
    },
    hardfork: undefined as string | undefined,
    hardforks: [] as ConfigHardfork[],
    bootstrapNodes: [],
    consensus:
        config.clique !== undefined
            ? {
              type: 'poa',
              algorithm: 'clique',
              clique: {
                // The recent geth genesis seems to be using blockperiodseconds
                // and epochlength for clique specification
                // see: https://hackmd.io/PqZgMpnkSWCWv5joJoFymQ
                period: config.clique.period ?? config.clique.blockperiodseconds,
                epoch: config.clique.epoch ?? config.clique.epochlength,
              },
            }
            : {
              type: 'pow',
              algorithm: 'ethash',
              ethash: {},
            },
  }

  const forkMap: { [key: string]: { name: string; postMerge?: boolean; isTimestamp?: boolean } } = {
    [Hardfork.Homestead]: { name: 'homesteadBlock' },
    [Hardfork.Dao]: { name: 'daoForkBlock' },
    [Hardfork.TangerineWhistle]: { name: 'eip150Block' },
    [Hardfork.SpuriousDragon]: { name: 'eip155Block' },
    [Hardfork.Byzantium]: { name: 'byzantiumBlock' },
    [Hardfork.Constantinople]: { name: 'constantinopleBlock' },
    [Hardfork.Petersburg]: { name: 'petersburgBlock' },
    [Hardfork.Istanbul]: { name: 'istanbulBlock' },
    [Hardfork.MuirGlacier]: { name: 'muirGlacierBlock' },
    [Hardfork.Berlin]: { name: 'berlinBlock' },
    [Hardfork.London]: { name: 'londonBlock' },
    [Hardfork.MergeForkIdTransition]: { name: 'mergeForkBlock', postMerge: mergeForkIdPostMerge },
    [Hardfork.Shanghai]: { name: 'shanghaiTime', postMerge: true, isTimestamp: true },
    [Hardfork.ShardingForkDev]: { name: 'shardingForkTime', postMerge: true, isTimestamp: true },
  }

  // forkMapRev is the map from config field name to Hardfork
  const forkMapRev = Object.keys(forkMap).reduce((acc, elem) => {
    acc[forkMap[elem].name] = elem
    return acc
  }, {} as { [key: string]: string })
  const configHardforkNames = Object.keys(config).filter(
      (key) => forkMapRev[key] !== undefined && config[key] !== undefined && config[key] !== null
  )

  params.hardforks = configHardforkNames
      .map((nameBlock) => ({
        name: forkMapRev[nameBlock],
        block:
            forkMap[forkMapRev[nameBlock]].isTimestamp === true || typeof config[nameBlock] !== 'number'
                ? null
                : config[nameBlock],
        timestamp:
            forkMap[forkMapRev[nameBlock]].isTimestamp === true && typeof config[nameBlock] === 'number'
                ? config[nameBlock]
                : undefined,
      }))
      .filter((fork) => fork.block !== null || fork.timestamp !== undefined) as ConfigHardfork[]

  params.hardforks.sort(function (a: ConfigHardfork, b: ConfigHardfork) {
    return (a.block ?? Infinity) - (b.block ?? Infinity)
  })

  params.hardforks.sort(function (a: ConfigHardfork, b: ConfigHardfork) {
    return (a.timestamp ?? genesisTimestamp) - (b.timestamp ?? genesisTimestamp)
  })

  if (config.terminalTotalDifficulty !== undefined) {
    // Following points need to be considered for placement of merge hf
    // - Merge hardfork can't be placed at genesis
    // - Place merge hf before any hardforks that require CL participation for e.g. withdrawals
    // - Merge hardfork has to be placed just after genesis if any of the genesis hardforks make CL
    //   necessary for e.g. withdrawals
    const mergeConfig = {
      name: Hardfork.Merge,
      ttd: config.terminalTotalDifficulty,
      block: null,
    }

    // Merge hardfork has to be placed before first hardfork that is dependent on merge
    const postMergeIndex = params.hardforks.findIndex(
        (hf: any) => forkMap[hf.name]?.postMerge === true
    )
    if (postMergeIndex !== -1) {
      params.hardforks.splice(postMergeIndex, 0, mergeConfig as unknown as ConfigHardfork)
    } else {
      params.hardforks.push(mergeConfig as unknown as ConfigHardfork)
    }
  }

  const latestHardfork = params.hardforks.length > 0 ? params.hardforks.slice(-1)[0] : undefined
  params.hardfork = latestHardfork?.name
  params.hardforks.unshift({ name: Hardfork.Chainstart, block: 0 })

  return params
}

/**
 * Parses a genesis.json exported from Geth into parameters for Common instance
 * @param json representing the Geth genesis file
 * @param name optional chain name
 * @returns parsed params
 */
export function parseGethGenesis(json: any, name?: string, mergeForkIdPostMerge?: boolean) {
  try {
    if (['config', 'difficulty', 'gasLimit', 'alloc'].some((field) => !(field in json))) {
      throw new Error('Invalid format, expected geth genesis fields missing')
    }https://github.com/ethereumjs/ethereumjs-monorepo/blob/60995fb50aa56e5749d471eb7fa424403c3e6249/packages/client/test/rpc/helpers.ts#L217
    if (name !== undefined) {
      json.name = name
    }
    return parseGethParams(json, mergeForkIdPostMerge)
  } catch (e: any) {
    throw new Error(`Error parsing parameters file: ${e.message}`)
  }
}

const generatedGenesisCLDevnet3030_ETH2_VAL_TOOLS = readFileSync('./test/e2e/interop/fixtures/devnet3030_genesis_from_eth2_testnet_genesis.json', 'utf-8');
const depositData120ValidatorsDevnet3030 = readFileSync('./test/e2e/interop/fixtures/deposit_data_devnet3030.json', 'utf-8')
