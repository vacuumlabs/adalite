describe('AdaLite Test Suite', () => {
  describe('CBOR', () => {
    require('./cbor')
  })
  describe('Mnemonic Crypto Provider', () => {
    require('./cardano-wallet-secret-crypto-provider')
  })
  describe('Address Manager', () => {
    require('./address-manager')
  })
  describe('Blockchain Explorer', () => {
    require('./blockchain-explorer')
  })
  describe('Cardano Wallet', () => {
    require('./cardano-wallet')
  })
  describe('Import/Export Wallet as JSON', () => {
    require('./keypass-json')
  })
  describe('Shelley testnet', () => {
    require('./shelley')
  })
})
