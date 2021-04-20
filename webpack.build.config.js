const webpack = require('webpack')
const glob = require('glob')

const env = process.env.NODE_ENV
const isProd = env === 'production'

let entry = [
  'babel-regenerator-runtime', // babel-regenerator-runtime is required for ledger
  './app/frontend/walletApp.js',
]
if (!isProd) {
  /*
  Till we do not import css from react components, we need to have
  this workaround for Hot reload to work with global css.
  */
  const globalCssPathnames = glob.sync('./app/public/css/**/*.css') || []
  entry = entry.concat(globalCssPathnames)
  entry.push('webpack-hot-middleware/client?path=/__webpack_hmr')
}

module.exports = {
  entry,
  output: {
    filename: 'frontend.bundle.js',
    libraryTarget: 'var',
    library: 'CardanoFrontend',
    path: `${__dirname}/app/dist/js`,
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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // {
      //   test: /\.wasm$/,
      //   type: 'webassembly/experimental',
      // },
    ],
  },
  resolve: {
    alias: {
      'babel-runtime': '@babel/runtime', // so both ledger and trezor-connect use the same library for babel runtime
      'unistore': `${__dirname}/app/frontend/libs/unistore`,
      'file-saver': `${__dirname}/app/frontend/libs/file-saver`,
      'qrious': `${__dirname}/app/frontend/libs/qrious`,
    },
    extensions: ['.tsx', '.ts', '.js', '.wasm'],
  },
  plugins: [
    !isProd && new webpack.HotModuleReplacementPlugin(),
  ].filter(Boolean),
}
