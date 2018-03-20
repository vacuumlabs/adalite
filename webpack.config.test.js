const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')


let plugins = []

// detect heroku environment by checking the process.env variable
if (process !== undefined && process.env !== undefined) {
  plugins = new webpack.EnvironmentPlugin( { ...process.env } )
} else {
  plugins = new Dotenv()
}

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
  plugins,
  mode: 'development',
}
