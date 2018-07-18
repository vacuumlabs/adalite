module.exports = {
  entry: `${__dirname}/tests/src/index.js`,
  output: {
    path: `${__dirname}/tests`,
    filename: 'dist/index.bundle.js',
  },
  node: {
    fs: 'empty',
  },
  externals: {
    'trezor-connect': 'TrezorConnect',
    // to avoid including webpack's 'crypto' if window.crypto is available - reduces bundle size
    'crypto': 'crypto',
  },
  mode: 'development',
}
