module.exports = {
  entry: './frontend/walletApp.js',
  output: {
    filename: 'frontend.bundle.js',
    libraryTarget: 'var',
    library: 'CardanoFrontend',
    path: `${__dirname}/public_wallet_app/js`,
  },
  mode: 'development',
  node: {
    fs: 'empty',
  },
}
