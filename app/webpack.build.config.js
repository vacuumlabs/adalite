const env = process.env.NODE_ENV

module.exports = {
  entry: ['babel-regenerator-runtime', './frontend/walletApp.js'], // babel-regenerator-runtime is required for ledger
  output: {
    filename: 'frontend.bundle.js',
    libraryTarget: 'var',
    library: 'CardanoFrontend',
    path: `${__dirname}/dist/js`,
    publicPath: '/js/',
  },
  optimization: {
    minimize: false,
  },
  devtool: 'source-map',
  mode: env || 'development',
  externals: {
    // to avoid including webpack's 'crypto' if window.crypto is available - reduces bundle size
    crypto: 'crypto',
  },
  node: {
    fs: 'empty',
  },
}
