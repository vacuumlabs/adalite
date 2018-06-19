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
      'DdzFFzCqrhssmYoG5Eca1bKZFdGS8d6iag1mU4wbLeYcSPVvBNF2wRG8yhjzQqErbg63N6KJA4DHqha113tjKDpGEwS5x1dT2KfLSbSJ'
    )
  })

  it('should properly compute change address for used wallet with offset 0', async () => {
    assert.equal(
      await wallet.getChangeAddress(),
      'DdzFFzCqrhsnx5973UzwoEcQ7cN3THD9ZQZvbVd5srhrPoECSt1WUTrQSR8YicSnH3disaSxQPcNMUEC7XNuFxRd8jCAKVXLne3r29xs'
    )
  })

  it('should properly compute change address with offset greater than 0', async () => {
    assert.equal(
      await wallet.getChangeAddress(5),
      'DdzFFzCqrht4APWANPv7a1RtkQgh62XuKDqzzjjtrAMwpDiSB65YX7GeY8pMPrfkXD16iSS1jD4efYRkogBWnZoH8QHWPwHjFa5HLYLX'
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
      '839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581c4617109fadd39396b981833f3694fc8e60658cbcc2a40d831e43c00ba101581e581c140539c64edded60a7f2d46967d90757466da40a8148314d69bf00d2001a28c4ea001a002a8df7ffa0'

    assert.equal(txAuxSerialized, expectedtxAuxSerialized)
  })

  // transaction hash computation
  it('should properly compute transaction hash', async () => {
    const txAux = await wallet._prepareTxAux(myAddress, 47)
    const expectedTxHash = '229a5ec5e839100a4cd7a9d2df4aafaf3f17453f5c3a4b7072fc3c4a632f689f'

    assert.equal(txAux.getId(), expectedTxHash)
  })

  // whole transaction serialization
  it('should properly serialize the whole transaction', async () => {
    const tx = await wallet.prepareTx(myAddress, 47)

    const expectedTxBody =
      '82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581c4617109fadd39396b981833f3694fc8e60658cbcc2a40d831e43c00ba101581e581c140539c64edded60a7f2d46967d90757466da40a8148314d69bf00d2001a28c4ea001a002a8df7ffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e58403fc8ec8c94cf81bf214ef7e739b06a4033038516e174be601c4ae652376488dce3d312d1da0973ef18dc493248e8cb806116f60859d0bdf0d370e4fbbe88bc088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840bbd30bdc77a6798ee5035344aa72f7bc2a13f3efdc4a0a1969f80a47edb3ef8b46a9c445c91a376bd0651edc8cbd80fa3072001707f0a9f6909cbb532eb2440c'

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
