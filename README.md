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

### plain html + js
`yarn build-bundle` (produces `cardano.bundle.js`)

Open `index-simple.html` in a browser

### simple Redux

```
yarn run build-frontend && yarn run run-frontend
```

TODOs:
- unify build with building cardano wallet itself. No special webpack config and frontend.html are
  needed
- get rid of live-server; setup hot-reloading with webpack for easier development
- check out TODO(TK) within the codebase
