const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')

module.exports = {
  entry: './test/test.js',
  output: {
    filename: 'cardano.bundle.test.js',
    libraryTarget: 'var',
    library: 'CardanoTest',
    path: __dirname + "/test/browser/js",
  },
  node: {
    fs: 'empty',
  },
  plugins: [
    new Dotenv(),
    new webpack.EnvironmentPlugin( { ...process.env } )
  ],
  mode: 'development',
}
