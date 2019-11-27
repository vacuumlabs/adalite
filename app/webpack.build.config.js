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
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      'babel-runtime': '@babel/runtime', // so both ledger and trezor-connect use the same library for babel runtime
      'unistore': `${__dirname}/frontend/libs/unistore`,
      'file-saver': `${__dirname}/frontend/libs/file-saver`,
      'qrious': `${__dirname}/frontend/libs/qrious`,
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
}
