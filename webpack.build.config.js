module.exports = {
  entry: './frontend/walletApp.js',
  output: {
    filename: 'frontend.bundle.js',
    libraryTarget: 'var',
    library: 'CardanoFrontend',
    path: `${__dirname}/public_wallet_app/js`,
  },
  externals: {
    'trezor-connect': 'TrezorConnect',
  },
  mode: 'development',
  node: {
    fs: 'empty',
  },
}
