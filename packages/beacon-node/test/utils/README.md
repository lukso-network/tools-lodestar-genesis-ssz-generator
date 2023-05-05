# LUKSO `genesis.szz` state generator

## Installation

```bash
# Clone the repo
$ git clone https://github.com/lukso-network/tools-lodestar-genesis-szz-generator.git

# Change into created folder
$ cd tools-lodestar-genesis-szz-generator

# Change to the right branch
$ git checkout spike/pos-from-the-start

# Install dependencies and build
$ yarn install
...
$ yarn build
```

## Generate the genesis.szz
1. Go to `cd packages/beacon-node`
2. Generate the `deposit_data.json` via [https://github.com/lukso-network/network-genesis-deposit-contract](https://github.com/lukso-network/network-genesis-deposit-contract#fetching-all-the-deposit-data#fetching-all-the-deposit-data), or use the pregenerated one from the `packages/beacon-node/test/utils/fixtures` folder
2. Copy the LUKSO Mainnet [network config files](https://github.com/lukso-network/network-configs/tree/main/mainnet/shared) (`config.yaml`, `genesis.json`) and the `deposit_data.json` to the `packages/beacon-node/test/utils/fixtures` folder
3. Generate the genesis block hash from the `genesis.json` via [https://github.com/mxmar/eth1genesis](https://github.com/mxmar/eth1genesis), or use the following pregenerated ones:
    - 35M LYX Initial Supply: `0x...`
    - 42M LYX Initial Supply: `0x...`
    - 100M LYX Initial Supply: `0x...`
4. Run `ts-node --esm test/utils/generateGenesisState.ts <your genesis block hash>`
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
