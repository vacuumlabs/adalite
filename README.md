# Cardano lite wallet

# Few disclaimers before we start
CardanoLite is not created by Cardano Foundation. The official Cardano team did not review this code
and is not responsible for any damage it may cause you. The CardanoLite project is in alpha stage
and should be used for penny-transactions only. We appreciate feedback, especially review of the
crypto-related code.

A very simple Cardano wallet made entirely in js. The project is in alpha version. Currently, you
should use it with penny transactions only.

## Why this

Official Cardano wallet is quite heavy-weight. It runs full node (this means: long syncing) and
downloads >500MB JavaScript dependencies (this means: not very secure). CardanoLite solves this -
it's really lite (< 3000 Lines of code) thus auditable. Since it doesn't run a full node it's also
fast. No syncing with other nodes is necessary; recovery of your wallet from mnemonic takes <1
second.

## Validate the source

Currently, there is no hardware wallet integration (though we plan doing this). If you want to be
sure the webpage really runs the correct code, you can verify its integrity:

- checkout the latest version (currently 1.0.0)
- build the project
- download the source .js from devtools and compare it to the built version

## Compatibility with Daedalus

If you generate your wallet with CardanoLite, you can see it's content in Daedalus. The catch is -
if you generate new addresses in Daedalus, CardanoLite won't recognize them. You'll still be able to
use your wallet, but in Daedalus only, there is no way back (but to transfer your funds to the new
wallet).

## Run project locally

#### Configuration

Prepare `.env` file
e.g. by `cp .env.example .env`

#### Cardano node proxy
This component is simply forwarding HTTP requests to raw TCP communication. Since this service only
forwards signed transactions so fundamentally it cannot do malicious stuff.

To run CardanoLite locally, you need to run this locally as well. Fetch sources from
(git+https://github.com/vacuumlabs/cardano-node-proxy.git), then
```
yarn
cardano_node_proxy_port=3001 yarn run main
```

#### Run CardanoLite

```
yarn install
yarn build
PORT=3000 yarn start-server
```
navigate to http://localhost:3000 (or wherever you've configured)

## test

```
yarn install
yarn test
```

Open `test.html` in browser
