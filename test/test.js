describe('CardanoLite Test Suite', () => {
  describe('Mnemonic Handling', () => {
    require('./tests/mnemonic')
  })
  describe('HD Node', () => {
    require('./tests/hd-node')
  })
  describe('CBOR', () => {
    require('./tests/cbor')
  })
  describe('Mnemonic Crypto Provider', () => {
    require('./tests/cardano-mnemonic-crypto-provider')
  })
  describe('Blockchain Explorer', () => {
    require('./tests/blockchain-explorer')
  })
  describe('Cardano Wallet', () => {
    require('./tests/cardano-wallet')
  })
  describe('Import/Export Wallet as JSON', () => {
    require('./tests/keypass-json')
  })
})
