const webpack = require('webpack')

module.exports = {
  entry: `${__dirname}/app/tests/src/index.ts`,
  output: {
    path: `${__dirname}/app/tests`,
    filename: 'dist/index.bundle.js',
  },
  externals: {
    // to avoid including webpack's 'crypto' if window.crypto is available - reduces bundle size
    crypto: 'crypto',
  },
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      react: 'preact/compat',
    },
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  plugins: [
    // Auto-import `Buffer`:
    // https://github.com/webpack/changelog-v5/issues/10#issuecomment-615877593
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
}
