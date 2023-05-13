# LUKSO `genesis.ssz` state generator

## Installation

```bash
# Clone the repo
$ git clone https://github.com/lukso-network/tools-lodestar-genesis-ssz-generator.git

# Change into created folder
$ cd tools-lodestar-genesis-ssz-generator

# Change to the right branch
$ git checkout spike/pos-from-the-start

# Install ts-node globally
$ yarn global add ts-node

# Install dependencies and build
$ lerna bootstrap
$ yarn install
$ yarn build
```

## Generate the genesis.ssz
1. Go to `cd packages/beacon-node`
2. Generate the `deposit_data.json` via [https://github.com/lukso-network/network-genesis-deposit-contract](https://github.com/lukso-network/network-genesis-deposit-contract#fetching-all-the-deposit-data), or use the pregenerated one from the `packages/beacon-node/test/utils/fixtures` folder
2. Copy the LUKSO Mainnet [network config files](https://github.com/lukso-network/network-configs/tree/main/mainnet/shared) (`config.yaml`, `genesis.json`) and the `deposit_data.json` to the `packages/beacon-node/test/utils/fixtures` folder
3. Generate the **genesis block hash** and **genesis block state root** from the `genesis.json` via the [Genesis hash calculator](https://github.com/lukso-network/network-genesis-hash-calc), or use the following pregenerated ones:
    - 35M LYX Initial Supply:
        - block hash: `0xbe7703028edf8ececa882f81eae15893b06129ab24a86ceaaecf7925524430b0`
        - state root: `0x5653d878f9aee2bf11a8dedf2bfa656b89b805f232bb44cb14a6681a0fa96e62`
    - 42M LYX Initial Supply: 
        - block hash: `0x7f742be7dad62f9a54d5e8581c393e88b9b6c882139fc3313a18e3cb8e288014`
        - state root: `0x7bef7fff93b34039e3823374000fce0d1b20da03d6f4fca824cf06580536a760`
    - 100M LYX Initial Supply: 
        - block hash: `0x022fcabfb7d5f69c48a06d74a2ef819f354e60b009393f24e2010d7d6c69f9bd`
        - state root: `0xcbc79c23d8f320eec15888344265d6c407cdd28d040c94a626c952e5b68e94d5`
4. Run `ts-node --esm test/utils/generateGenesisState.ts <your genesis block hash> <your genesis state root>`
5. You can find your `genesis.ssz` and `genesis_ssz.json` in the `packages/beacon-node` directory


## Tests

Test is available under `packages/beacon-node/test/e2e/interop` directory. It's `genesisState.test.ts`.
Test fixtures are available under `packages/beacon-node/test/e2e/interop/fixtures` directory (`config.yaml`, `genesis.json` and `deposit_data.json`).

### How to run test?

1. Clone repository
2. Checkout `spike/pos-from-the-start` git branch
3. Run `yarn` in project root directory
4. Run `yarn build` in project root directory
5. Go to `cd packages/beacon-node`
6. Run test: `LODESTAR_PRESET=mainnet yarn mocha 'test/e2e/interop/genesisState.test.ts'` command
