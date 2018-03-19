module.exports = {
  entry: './test/test.js',
  output: {
    filename: 'cardano.bundle.test.js',
    libraryTarget: 'var',
    library: 'CardanoTest',
    path: __dirname,
  },
  node: {
    fs: 'empty',
  },
  mode: 'production',
}
