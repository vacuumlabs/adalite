const env = process.env.NODE_ENV

module.exports = {
  entry: ['@babel/polyfill', './frontend/walletApp.js'], // @babel/polyfill is required for ledger integration
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
