const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')


const plugins = []

// detect heroku environment by checking the process.env variable
if (process !== undefined && process.env !== undefined) {
  plugins.push(new webpack.EnvironmentPlugin({...process.env}))
} else {
  plugins.push(new Dotenv())
}

module.exports = {
  entry: './frontend/walletApp.js',
  output: {
    filename: 'frontend.bundle.js',
    library: 'cardanoFrontend',
    path: __dirname + "/public/js",
  },
  mode: 'development',
  plugins,
  node: {
    fs: 'empty',
  },
}
