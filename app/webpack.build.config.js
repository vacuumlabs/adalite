module.exports = {
  entry: './frontend/walletApp.js',
  output: {
    filename: 'frontend.bundle.js',
    libraryTarget: 'var',
    library: 'CardanoFrontend',
    path: `${__dirname}/dist/js`,
    publicPath: '/js/',
  },
  externals: {
    'trezor-connect': 'TrezorConnect',
    // to avoid including webpack's 'crypto' if window.crypto is available - reduces bundle size
    'crypto': 'crypto',
  },
  mode: 'development',
  node: {
    fs: 'empty',
  },
}
