# cardano

A very simple Cardano wallet made in js

## prepare
#### config
prepare `congig.js` (in desired `forBrowser/` or `withNode/` folder

e.g. `cp config.js.example config.js`

#### Cardano transaction submitter
run Cardano transaction submitter (git+https://github.com/vacuumlabs/cardano-transaction-submitter.git) according to config (default localhost:3001)


To run open `forBrowser/index.html` in a browser (Chrome stable)

To run testsuite `forBrowser/test.html` in a browser (Chrome stable)

To build a bundled project:
`cd forBrowser`
`yarn install`
`yarn build`
'ln -s dist/cardano.bundle.js ../`

To build testsuite:
`cd forBrowser/cardano/`
`yarn install`
`yarn buildTest`
'ln -s dist/cardano.bundle.test.js ../`


# node.js version of cardano
deprecated, for dev use only

To run tests To build a bundled project:
`cd withNode`

`yarn install`
`yarn test`
