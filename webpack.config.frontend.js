module.exports = {
  entry: './frontend/walletApp.js',
  output: {
    filename: 'frontend.bundle.js',
    library: 'cardanoFrontend',
    path: __dirname,
  },
  mode: 'development',
}
