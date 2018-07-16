const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: './test/test.js',
  output: {
    filename: 'cardano.bundle.test.js',
    libraryTarget: 'var',
    library: 'CardanoTest',
    path: `${__dirname}/test/browser/js`,
  },
  node: {
    fs: 'empty',
  },
  externals: {
    'trezor-connect': 'TrezorConnect',
    // to avoid including webpack's 'crypto' if window.crypto is available - reduces bundle size
    'crypto': 'crypto',
  },
  plugins: [new Dotenv()],
  mode: 'development',
}
