const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')


module.exports = {
  entry: './cardano-wallet.js',
  output: {
    filename: 'cardano.bundle.js',
    libraryTarget: 'var',
    library: 'Cardano',
    path: __dirname + "/public/js",
  },
  node: {
    fs: 'empty',
  },
  plugins: [
    new Dotenv(),
    new webpack.EnvironmentPlugin( { ...process.env } )
  ],
  mode: 'production',
}
