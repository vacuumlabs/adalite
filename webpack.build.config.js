const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: './wallet/cardano-wallet.js',
  output: {
    filename: 'cardano.bundle.js',
    libraryTarget: 'var',
    library: 'Cardano',
    path: `${__dirname}/public/js`,
  },
  mode: 'production',
  node: {
    fs: 'empty',
  },
  plugins: [new Dotenv()],
}
