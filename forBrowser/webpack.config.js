const path = require('path');

module.exports = {
  context: path.resolve(__dirname, "cardano"),
  entry: './index',
  output: {
    filename: 'cardano.bundle.js',
    libraryTarget: 'var',
    library: 'Cardano'
  },

}
