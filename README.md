# CardanoLite wallet

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
fast. No syncing with other nodes is necessary; recovery of your wallet from mnemonic takes only a few seconds.

## Validate the source

Currently, there is no hardware wallet integration (though we plan doing this). If you want to be
sure the webpage really runs the correct code, you can verify its integrity:

- checkout the latest version (currently 1.0.0)
- build the project
- download the source .js from devtools and compare it to the built version

## Compatibility with Daedalus

If you generate your wallet with CardanoLite, you can see it's content in Daedalus. The catch is -
if you generate new addresses in Daedalus and use it, CardanoLite won't recognize them. If you want
to continue using your wallet in CardanoLite, you should move the funds to an address recognized by
CardanoLite.

## Run project locally

#### Configuration

Prepare `.env` file
e.g. by `cp .env.example .env`

#### Run CardanoLite

```
yarn install
yarn build
PORT=3000 yarn start-server
```
Navigate to http://localhost:3000 (or wherever you've configured)

#### Development

For development you can start the server with

```
yarn dev
```

It runs webpack with the `--watch` flag and the server with `PORT=3000` unless you specify otherwise

## test

```
yarn test
```

Open `app/tests/index.html` in browser

Check us out at https://www.cardanolite.com