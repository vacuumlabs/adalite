const path = require('path')

module.exports = {
  entry: './index',
  output: {
    filename: 'cardano.bundle.js',
    libraryTarget: 'var',
    library: 'Cardano',
  },
  node: {
    fs: 'empty',
  },
}
