const Dotenv = require('webpack')


module.exports = {
  entry: './frontend/walletApp.js',
  output: {
    filename: 'frontend.bundle.js',
    libraryTarget: 'var',
    library: 'CardanoFrontend',
    path: __dirname + "/public/js",
  },
  mode: 'development',
  node: {
    fs: 'empty',
  },
  plugins: [new webpack.EnvironmentPlugin({...process.env})],
}
