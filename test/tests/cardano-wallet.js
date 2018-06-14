const assert = require('assert')
const cbor = require('cbor')

const {CardanoWallet, txFeeFunction} = require('../../wallet/cardano-wallet')
const CARDANOLITE_CONFIG = require('../../server/helpers/loadFrontendConfig')
const mockObject = require('../mock')
const mock = mockObject(CARDANOLITE_CONFIG)

describe('transaction fee function', () => {
  it('should properly compute transaction fee based on transaction size parameter', () => {
    assert.equal(txFeeFunction(50), 157579)
    assert.equal(txFeeFunction(351), 170807)
  })
})

const testSeed = 39

const unusedWallet = CardanoWallet(
  'rain flame hip basic extend capable chair oppose gorilla fun aunt emotion',
  CARDANOLITE_CONFIG,
  testSeed
)
const wallet = CardanoWallet(
  'logic easily waste eager injury oval sentence wine bomb embrace gossip supreme',
  CARDANOLITE_CONFIG,
  testSeed
)
const myAddress =
  'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY'

// eslint-disable-next-line prefer-arrow-callback
describe('wallet balance computation', function() {
  this.timeout(10000)

  mock.mockBlockChainExplorer()
  mock.mockUtxoEndpoint()

  it('should properly fetch empty wallet balance', async () => {
    assert.equal(await unusedWallet.getBalance(), 0)
  })

  it('should properly fetch nonempty wallet balance', async () => {
    assert.equal(await wallet.getBalance(), 2967795)
  })
})

// eslint-disable-next-line prefer-arrow-callback
describe('wallet change address computation', function() {
  this.timeout(10000)

  mock.mockBlockChainExplorer()

  it('should properly compute change address for unused wallet', async () => {
    assert.equal(
      await unusedWallet.getChangeAddress(),
      'DdzFFzCqrhsef6yEYwhNtfoNQEFAjr2Uur66mBxjnBX6cZyEDLfodWjDxj4K4VDNkAqQjTQVDxrpEptvL85xYLpHP9HUEAPm31tJME3K'
    )
  })

  it('should properly compute change address for used wallet with offset 0', async () => {
    assert.equal(
      await wallet.getChangeAddress(),
      'DdzFFzCqrht5CupPRNPoukz3K1FD7TvYeSXbbM3oPvmmmLTSsbGzKHHypKNqtSXqVyvpBwqUw3vpRXYhpkbaLKkHw5qUEHr2v7h7Roc7'
    )
  })

  it('should properly compute change address with offset greater than 0', async () => {
    assert.equal(
      await wallet.getChangeAddress(5),
      'DdzFFzCqrht9QRUpvJ8dpMfY8LRPuwHTtun7rwWT4x2HYzPsx9zPtXDXXBnpL44qEdyfwu3VWKN6jreVJdwSfLbGHzZVQcNNZztXfc2K'
    )
  })
})

// eslint-disable-next-line prefer-arrow-callback
describe('successful transaction fee computation', function() {
  this.timeout(10000)

  mock.mockBlockChainExplorer()

  it('should compute the right transaction fee for given transaction', async () => {
    assert.equal(await wallet.getTxFee(myAddress, 47), 178893)
  })

  /*
  * commented out because now even for invalid transactions it returns the fee
  * when max number of inputs is used
  *
  * it(
  *  'should return fee -1 for an unallowed transaction (not enough resources on the account)',
  *   async () => {
  *     assert.equal(await wallet.getTxFee(myAddress, 145000000), -1)
  *   }
  * )
  */
})

// eslint-disable-next-line prefer-arrow-callback
describe('transaction serialization', function() {
  mock.mockBlockChainExplorer()

  it('should properly serialize transaction before signing', async () => {
    const txAux = await wallet._prepareTxAux(myAddress, 47)

    // transaction serialization before providing witnesses
    const txAuxSerialized = cbor.encode(txAux).toString('hex')

    const expectedtxAuxSerialized =
      '839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cc257dee35f8401823d281d3320d31fef98fcbf904f5d5e03d94974fba101581e581c140539c64edded60a7f2d869373e87e744591935bfcdadaa8517974c001a40c66c8c1a002a8df7ffa0'

    assert.equal(txAuxSerialized, expectedtxAuxSerialized)
  })

  // transaction hash computation
  it('should properly compute transaction hash', async () => {
    const txAux = await wallet._prepareTxAux(myAddress, 47)
    const expectedTxHash = 'f892d1487903ae721373d6ab8e72c38ef855f61ba4daf16d40b1ace0f1d2b1de'

    assert.equal(txAux.getId(), expectedTxHash)
  })

  // whole transaction serialization
  it('should properly serialize the whole transaction', async () => {
    const tx = await wallet.prepareTx(myAddress, 47)

    const expectedTxBody =
      '82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cc257dee35f8401823d281d3320d31fef98fcbf904f5d5e03d94974fba101581e581c140539c64edded60a7f2d869373e87e744591935bfcdadaa8517974c001a40c66c8c1a002a8df7ffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840407b76b983b657b1dde00a9c90ca97d1f8310b088146fbe2997849747d4e3a633be8b037c56e7b7190e8be7902a01d0faea31f45d42534c3e735faa437925b088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840607573290ca775a7a953c9b63b91a66da9178751bf26caafaab7bbc2390dab260dc8049cd0f3fd24ee7db71dd82ec23e0280b3fcd35b6eee3fb9eb9c2b8c2d0f'

    assert.equal(tx.txBody, expectedTxBody)
  })
})

// eslint-disable-next-line prefer-arrow-callback
describe('test transaction submission', function() {
  this.timeout(10000)

  mock.mockTransactionSubmitter()

  it('should properly submit transaction', async () => {
    const result = await wallet.sendAda(myAddress, 47)
    assert.equal(result, true)
  })
})
