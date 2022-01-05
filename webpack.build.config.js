const webpack = require('webpack')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const env = process.env.NODE_ENV
const isProd = env === 'production'

let entry = [
  'babel-regenerator-runtime', // babel-regenerator-runtime is required for ledger
]
if (!isProd) {
  /*
  Till we do not import css from react components, we need to have
  this workaround for Hot reload to work with global css.
  We are not using "glob" to get all files in "css" folder as order of files matters.
  */
  const cssPathnames = [
    './app/public/css/styles.css',
    './app/public/css/0-767px.css',
    './app/public/css/0-1024px.css',
    './app/public/css/0-1366px.css',
    './app/public/css/767-1366px.css',
    './app/public/css/768-1024px.css',
    './app/public/css/1024-1112px.css',
  ]
  // Check if "cssPathnames" are up-to-date with css files stored in "app/public/css" folder
  if (JSON.stringify([...cssPathnames].sort()) !== JSON.stringify(glob.sync('./app/public/css/**/*.css').sort())) {
    throw new Error('Webpack: CSS pathnames are outdated!')
  }

  entry = entry.concat(cssPathnames)
  entry.push('webpack-hot-middleware/client?path=/__webpack_hmr')
}
// This one must be after global css, so that css-modules which are imported from js
// can override global css
entry.push('./app/frontend/walletApp.js')

module.exports = {
  entry,
  output: {
    filename: 'js/[name].bundle.js',
    libraryTarget: 'var',
    library: 'CardanoFrontend',
    path: `${__dirname}/app/dist`,
    publicPath: '/',
  },
  optimization: {
    minimize: false,
    // Create one, not two chunks per dynamic import.
    // See https://stackoverflow.com/questions/50275183/why-is-webpack-generating-2-chunks-per-dynamic-import
    splitChunks: {
      cacheGroups: {
        defaultVendors: false,
      },
    },
  },
  devtool: 'source-map',
  mode: env || 'development',
  externals: {
    // to avoid including webpack's 'crypto' if window.crypto is available - reduces bundle size
    crypto: 'crypto',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      // For hot reloading of globally injected css
      {
        test: /^((?!\.module).)*\.css$/,
        use: [!isProd && 'style-loader', 'css-loader'].filter(Boolean),
      },
      {
        test: /\.module\.scss$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
              sourceMap: !isProd,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProd,
            },
          },
        ],
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
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
    },
    alias: {
      'babel-runtime': '@babel/runtime', // so both ledger and trezor-connect use the same library for babel runtime
      'unistore': `${__dirname}/app/frontend/libs/unistore`,
      'file-saver': `${__dirname}/app/frontend/libs/file-saver`,
      'qrious': `${__dirname}/app/frontend/libs/qrious`,
      'react': 'preact/compat',
    },
    extensions: ['.tsx', '.ts', '.js', '.wasm'],
  },
  plugins: [
    !isProd && new webpack.HotModuleReplacementPlugin(),
    isProd && new MiniCssExtractPlugin({
      filename: 'css/modules.css',
    }),
    // Auto-import `Buffer`:
    // https://github.com/webpack/changelog-v5/issues/10#issuecomment-615877593
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ].filter(Boolean),
}
