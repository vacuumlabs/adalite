# AdaLite wallet

A very simple Cardano wallet written entirely in JS.

# Some disclaimers before we start

AdaLite is not created by Cardano Foundation, Emurgo, or IOHK. The official Cardano team has not reviewed this code and is not responsible for any damage it may cause you. AdaLite does not store your private keys and you are responsible for storing them safely. Please be aware that if your computer is compromised, your mnemonic may be leaked when used as the access method on Adalite. We encourage you to use AdaLite with a hardware wallet for maximum safety. We appreciate feedback, especially a review of the crypto-related code.

## Why we are building this

The [official Cardano wallet](https://github.com/input-output-hk/daedalus) from IOHK runs a full node and takes a long time to sync the blockchain. It's also very big and downloads >500MB of JavaScript dependencies (which can create a large attack surface and requires a lot of auditing). AdaLite is much smaller and is thus much easier to audit. Since it doesn't run a full node or require to sync the entire blockchain it's also very fast. Recovering your wallet from the mnemonic only takes a few seconds.

## Validate the source

If you want, you can verify the integrity of the code running in your browser, you can:

- checkout the latest version from the master branch (the one being deployed)
- build the project
- download the source .js from devtools and compare it to the built version

## Compatibility with Daedalus/Yoroi

See https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ#compatibility-with-other-wallets

## Run project locally

#### Configuration

Prepare `.env` file
e.g. by `cp .env.example .env`

#### Run AdaLite

```
yarn install
yarn build
ADALITE_PORT=3000 yarn start-server
```

Navigate to http://localhost:3000 (or wherever you've configured) and don't forget to set `.env` to `http://localhost:3000` if you were copying the default .env.example file. You may also need to disable caching in your browser to forget previous redirects.

#### Development

For development you can start the server with

```
yarn dev
```

It runs webpack with the `--watch` flag and the server with `PORT=3000` unless you specify otherwise

#### Creating releases

For creating releases we use tool [release-it](https://webpro.github.io/release-it/), tutorial and setup are written in [Releases](RELEASES.md) file

##### Mocking transaction submission

in .env set the following values (your local settings may differ but by default this should work):

```
ADALITE_ENABLE_SERVER_MOCKING_MODE = true
ADALITE_MOCK_TX_SUBMISSION_SUCCESS = true
ADALITE_MOCK_TX_SUMMARY_SUCCESS = false
```

The `ADALITE_ENABLE_SERVER_MOCKING_MODE` flag tells the server to start in mocking mode to avoid submitting transactions to the actual blockchain. Moreover, it mocks certain blockchain explorer endpoints to fake the transaction submission.

`ADALITE_MOCK_TX_SUBMISSION_SUCCESS` tells the mock server whether it has to return a success response for tx submission or not.

`ADALITE_MOCK_TX_SUMMARY_SUCCESS` tells the mock server whether to return that the transaction exists in the blockchain or not - this is useful for polling for transaction status after submission.

## Test

#### lint tests

```
yarn eslint
```

#### unit tests

```
yarn test
```

Open `app/tests/index.html` in browser

#### Cypress tests

Cypress requires the app to be running with correct environment variables. Type
```
yarn cypress:dev
```
to start the app with the correct settings. It calls `yarn dev` itself, but with correct environment variables for testing.

After that, you can either type
```
yarn cypress:open
```
to start the tests with the interactive Test runner, which allows time travel, logs, pausing, etc.

Or, to run the tests in a headless fashion, type
```
yarn cypress:run
```

If you wish to create a video of the tests, pass in `VIDEO=true yarn cypress:run` and videos of all test suites will be created in /app/cypress/videos.

Check us out at https://www.adalite.io

---

Donations are really appreciated!

BTC: [bc1q4jjxwlxs68kxv0zgv7f2sf2eh2svxlghz57e0l](https://www.blockchain.com/btc/address/bc1q4jjxwlxs68kxv0zgv7f2sf2eh2svxlghz57e0l)

ETH: [0xe1575549f79742d21E56426a1F9AD26997F5B9fb](https://etherscan.io/address/0xe1575549f79742d21E56426a1F9AD26997F5B9fb)

ADA: [addr1qxfxlatvpnl7wywyz6g4vqyfgmf9mdyjsh3hnec0yuvrhk8jh8axm6pzha46j5e7j3a2mjdvnpufphgjawhyh0tg9r3sk85ls4](https://cardanoexplorer.com/address/addr1qxfxlatvpnl7wywyz6g4vqyfgmf9mdyjsh3hnec0yuvrhk8jh8axm6pzha46j5e7j3a2mjdvnpufphgjawhyh0tg9r3sk85ls4)

## Trezor integration

Some notes on how to implement new coin into Trezor can be found here: https://github.com/vacuumlabs/trezor-core/wiki/Trezor-Development

## Hot reloading

Hot reloading is not working well with components that use `connect`. The project is leading towards removal of `connect` and its
replacement by `useSelector` so eventually this issue should be solved.
The issue you can experience with `connect` is that components would stop receiving state updates and you therefore need to reload the app.
