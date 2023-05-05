# Beacon genesis state generator (SSZ Generator)

## Build
1. Clone repository
2. Checkout `spike/pos-from-the-start` git branch
3. Run `yarn` in project root directory
4. Run `yarn build` in project root directory

## Generate the genesis.szz
1. Go to `cd packages/beacon-node`
2. Copy the LUKSO Mainnet [network config files](https://github.com/lukso-network/network-configs/tree/main/mainnet/shared) (`config.yaml`, `genesis.json` and `deposit_data.json`) to the `packages/beacon-node/test/utils/fixtures` directory
3. Generate the `genesis.json` genesis block hash via [https://github.com/mxmar/eth1genesis](https://github.com/mxmar/eth1genesis/releases/tag/v1.0.0), or use the following pregenerated ones:
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
