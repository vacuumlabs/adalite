const path = require('path')

module.exports = {
  entry: './cardano-wallet.js',
  output: {
    filename: 'cardano.bundle.test.js',
    libraryTarget: 'var',
    library: 'Cardano',
  },
  node: {
    fs: 'empty',
  },
}
