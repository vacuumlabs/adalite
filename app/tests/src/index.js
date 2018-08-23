<<<<<<< HEAD
describe('AdaLite Test Suite', () => {
  describe('Mnemonic Handling', () => {
    require('./mnemonic')
  })
=======
describe('CardanoLite Test Suite', () => {
>>>>>>> 72de8a4... derivation scheme V2 support for 15 word mnemonics
  describe('CBOR', () => {
    require('./cbor')
  })
  describe('Mnemonic Crypto Provider', () => {
    require('./cardano-wallet-secret-crypto-provider')
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
})
