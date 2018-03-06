# cardano

A very simple Cardano wallet made in js

## prepare
#### config
prepare `congig.js` (in desired `forBrowser/` or `withNode/` folder

e.g. `cp config.js.example config.js`

#### Cardano transaction submitter
run Cardano transaction submitter (git+https://github.com/vacuumlabs/cardano-transaction-submitter.git) according to config (default localhost:3001)

## test
`yarn install`

`yarn test`

Open `test.html` in a browser


## run
`yarn install`

`yarn build` (produces `cardano.bundle.js`)

Open `index.html` in a browser
