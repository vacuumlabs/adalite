module.exports = {
  entry: './cardano-wallet.js',
  output: {
    filename: 'cardano.bundle.js',
    libraryTarget: 'var',
    library: 'Cardano',
    path: __dirname,
  },
  node: {
    fs: 'empty',
  },
}
