const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')


let plugins = []

// detect heroku environment by checking the process.env variable
if (process !== undefined && process.env !== undefined) {
  plugins.push(new webpack.EnvironmentPlugin( { ...process.env } ))
} else {
  plugins.push(new Dotenv())
}

module.exports = {
  entry: './wallet/cardano-wallet.js',
  output: {
    filename: 'cardano.bundle.js',
    libraryTarget: 'var',
    library: 'Cardano',
    path: __dirname + "/public/js",
  },
  node: {
    fs: 'empty',
  },
  plugins,
  mode: 'production',
}
