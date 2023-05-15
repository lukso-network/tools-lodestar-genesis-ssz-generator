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
        - block hash: `0x2c72687b37cd99fa09d31859e77254ab33f36c40c8b6b30256e53e6b615249e2`
        - state root: `0x39edcdf13ea24fbd04fdbc02b0aac305af61d098a9b693d9989b319a5706c1d7`
    - 42M LYX Initial Supply: 
        - block hash: `0x1128be421fab40952edd402afd2f40b795d3ca5d5b06246405d5cb9e2bdd7b12`
        - state root: `0x39edcdf13ea24fbd04fdbc02b0aac305af61d098a9b693d9989b319a5706c1d7`
    - 100M LYX Initial Supply: 
        - block hash: `0xf8a6f1100602c027b5ffe64169fdeb36053c66faf753d83547b0dbdf7efa8ae0`
        - state root: `0xa98743b7d88c0262f12004994fe998e42e909c49e91b2218f5305fdec3ce1dfc`
4. Run `ts-node --esm test/utils/generateGenesisState.ts <your genesis block hash> <your genesis state root>` (Takes around 10min!)
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
