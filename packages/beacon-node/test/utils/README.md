# Beacon genesis state generator (SSZ Generator)

## Build & Run
1. Clone repository
2. Checkout `spike/pos-from-the-start` git branch
3. Run `yarn` in project root directory
4. Run `yarn build` in project root directory
5. Go to `cd packages/beacon-node`
6. Copy actual network configs files (`config.yaml`, `genesis.json` and `deposit_data.json`) to `packages/beacon-node/test/utils/fixtures` directory
7. Get the eth1 genesis block hash (like `0x7f943b389ac0c9c350198ab251d0915a33a657f0ab8b8b14f7999fabf120e4dd` for example) - see: https://github.com/mxmar/eth1genesis
8. Run `ts-node --esm test/utils/generateGenesisState.ts 0x7f943b389ac0c9c350198ab251d0915a33a657f0ab8b8b14f7999fabf120e4dd` (as a TypeScript file, the only argument for now is eth1 genesis block hash*)
9. You can find your `genesis.ssz` and `genesis_ssz.json` in `packages/beacon-node` directory

*There is no technical way in `loadstar` to get this eth1 genesis hash easily. I was using my simple go script (based on eth2-testnet-genesis)
to get this hash, because GoLang has `go-ethereum` library to simply get `genesis.json` and calculate all required data.
Binary releases: https://github.com/mxmar/eth1genesis/releases/tag/v1.0.0 (linux and darwin only!)

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
7. [DEPRECATED] You can find test state files in `packages/beacon-node` directory (test will generate files)
