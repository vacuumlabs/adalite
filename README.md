# AdaLite wallet
A very simple Cardano wallet written entirely in JS.

# Some disclaimers before we start
AdaLite is not created by Cardano Foundation, Emurgo, or IOHK. The official Cardano team has not reviewed this code and is not responsible for any damage it may cause you. The AdaLite does not store your private keys and you are responsible for storing them safely. Please be aware that if your computer is compromised, your mnemonic may be leaked when used as the access method on Adalite. We encourage you to use AdaLite with a hardware wallet for maximum safety. We appreciate feedback, especially a review of the crypto-related code.

## Why we are building this

The [official Cardano wallet](https://github.com/input-output-hk/daedalus) from IOHK runs a full node and takes a long time to sync the blockchain. It's also very big and downloads >500MB of JavaScript dependencies (which can create a large attack surface and requires a lot of auditing). AdaLite is much smaller (< 3000 Lines of code) and is thus much easier to audit. Since it doesn't run a full node or require to sync the entire blockchain it's also very fast. Recovering your wallet from the mnemonic only takes a few seconds. 

## Validate the source

If you want, you can verify the integrity of the code running in your browser, you can:

- checkout the latest version (currently 1.0.0)
- build the project
- download the source .js from devtools and compare it to the built version

## Compatibility with Daedalus

If you generate your wallet with AdaLite, you can see it's content in Daedalus. The catch is -
if you generate new addresses in Daedalus and use it, AdaLite won't recognize them. If you want
to continue using your wallet in AdaLite, you should move the funds to an address recognized by
AdaLite.

## Run project locally

#### Configuration

Prepare `.env` file
e.g. by `cp .env.example .env`

#### Run AdaLite

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

## test
#### lint tests
```
yarn eslint
```

#### unit tests
```
yarn test
```

Open `app/tests/index.html` in browser

Check us out at https://www.adalite.io

---
Donations are really appreciated!

BTC: [3Qk3BDbw4yym6PM6vWA4bAsFkY76EWwtnp](https://www.blockchain.com/btc/address/3Qk3BDbw4yym6PM6vWA4bAsFkY76EWwtnp)

ETH: [0xe1575549f79742d21E56426a1F9AD26997F5B9fb](https://etherscan.io/address/0xe1575549f79742d21E56426a1F9AD26997F5B9fb)

ADA: [DdzFFzCqrhsqedBRRVa8dZ9eFQfQErikMsgJC2YkkLY23gK4JzV9y6jKnRL8VSDEqczdzG3WYmj1vsXxCA2j1MvTS6GfMVA2dkiFrkK5](https://cardanoexplorer.com/address/DdzFFzCqrhsqedBRRVa8dZ9eFQfQErikMsgJC2YkkLY23gK4JzV9y6jKnRL8VSDEqczdzG3WYmj1vsXxCA2j1MvTS6GfMVA2dkiFrkK5)

## Trezor integration

Some notes on how to implement new coin into Trezor can be found here: https://github.com/vacuumlabs/trezor-core/wiki/Trezor-Development
