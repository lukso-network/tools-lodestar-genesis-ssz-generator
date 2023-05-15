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
        - block hash: `0xde30ee79cc0db657b94ab81ef0fabc28a12c9de0afe06c260f7e8004d46d6852`
        - state root: `0xede20a73c4fab8b11bdca866dde27f0f9fb91a49ca758ab3323f24f741c01891`
    - 42M LYX Initial Supply: 
        - block hash: `0x5df88817dfb9b00d8ef142370671e8a9bc00c548ab78fbaf205df53db2b24a26`
        - state root: `0xc5029d9940f62a897b231b3ccdb71c1bb79ecce029ce3309fe99f18820836115`
    - 100M LYX Initial Supply: 
        - block hash: `0x62ddc7f9c724b39cf9df1e6c8fe0f738613a0597718b1de5678e768b8493d1be`
        - state root: `0xcf9791846af3d21d47a2029c17ec4c10a7917bf16c275f14ddb5858dc1fa1833`
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
