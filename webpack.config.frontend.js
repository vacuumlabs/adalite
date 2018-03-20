module.exports = {
  entry: './walletApp.js',
  output: {
    filename: 'frontend.bundle.js',
    library: 'cardanoFrontend',
    path: __dirname + "/build",
  },
  mode: 'development',
  node: {
    fs: 'empty',
  },
}
