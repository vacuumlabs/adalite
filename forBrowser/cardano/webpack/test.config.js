const path = require('path')

module.exports = {
  entry: './test/test.js',
  output: {
    filename: 'cardano.bundle.test.js',
    libraryTarget: 'var',
    library: 'CardanoTest',
  },
  node: {
    fs: 'empty',
  },
}
