const assert = require('assert')
const cbor = require('borc')

const {CardanoWallet, txFeeFunction} = require('../../frontend/wallet/cardano-wallet')
const derivationSchemes = require('../../frontend/wallet/derivation-schemes')
const mockNetwork = require('./common/mock')
const {TxAux} = require('../../frontend/wallet/transaction')

const testSeed = 39

const mockConfig1 = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_WALLET_ADDRESS_LIMIT_V1: 5,
  ADALITE_GAP_LIMIT: 20,
}

const mockConfig2 = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_WALLET_ADDRESS_LIMIT_V1: 15,
  ADALITE_GAP_LIMIT: 20,
}

const unusedWalletConfig = {
  cryptoProvider: 'mnemonic',
  mnemonicOrHdNodeString:
    'rain flame hip basic extend capable chair oppose gorilla fun aunt emotion',
  config: mockConfig1,
  randomSeed: testSeed,
  network: 'mainnet',
  derivationScheme: derivationSchemes.v1,
}

const usedWalletConfig = {
  cryptoProvider: 'mnemonic',
  mnemonicOrHdNodeString:
    'logic easily waste eager injury oval sentence wine bomb embrace gossip supreme',
  config: mockConfig2,
  randomSeed: testSeed,
  network: 'mainnet',
  derivationScheme: derivationSchemes.v1,
}

const smallUtxosWalletConfig = {
  cryptoProvider: 'mnemonic',
  mnemonicOrHdNodeString: 'blame matrix water coil diet seat nerve street movie turkey jump bundle',
  config: mockConfig1,
  randomSeed: testSeed,
  network: 'mainnet',
  derivationScheme: derivationSchemes.v1,
}

const usedV2WalletConfig = {
  cryptoProvider: 'mnemonic',
  mnemonicOrHdNodeString:
    'cost dash dress stove morning robust group affair stomach vacant route volume yellow salute laugh',
  config: mockConfig1,
  randomSeed: testSeed,
  network: 'mainnet',
  derivationScheme: derivationSchemes.v2,
}

const wallets = {}

const initWallet = async (id, config) => {
  wallets[id] = await CardanoWallet(config)
}

before(() =>
  Promise.all([
    initWallet('unused', unusedWalletConfig),
    initWallet('used', usedWalletConfig),
    initWallet('smallUtxos', smallUtxosWalletConfig),
    initWallet('v2Used', usedV2WalletConfig),
  ])
)

const myAddress =
  'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY'

const shortAddress = 'Ae2tdPwUPEZ18ZjTLnLVr9CEvUEUX4eW1LBHbxxxJgxdAYHrDeSCSbCxrvx'

describe('transaction fee function', () => {
  it('should properly compute transaction fee based on transaction size parameter', () => {
    assert.equal(txFeeFunction(50), 157579)
    assert.equal(txFeeFunction(351), 170807)
  })
})

describe('wallet balance computation', () => {
  it('should properly fetch empty wallet balance', async () => {
    const mockNet = mockNetwork(mockConfig1)
    mockNet.mockBulkAddressSummaryEndpoint()

    assert.equal(await wallets.unused.getBalance(), 0)
    mockNet.clean()
  })

  it('should properly fetch nonempty wallet balance', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockBulkAddressSummaryEndpoint()

    assert.equal(await wallets.used.getBalance(), 2967795)
    mockNet.clean()
  })

  it('should properly fetch nonempty wallet balance with derivation scheme v2', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockBulkAddressSummaryEndpoint()

    assert.equal(await wallets.v2Used.getBalance(), 1497864)
    mockNet.clean()
  })
})

describe('wallet change address computation', () => {
  it('should properly compute change address for unused wallet', async () => {
    assert.equal(
      await wallets.unused.getChangeAddress(),
      'DdzFFzCqrhssmYoG5Eca1bKZFdGS8d6iag1mU4wbLeYcSPVvBNF2wRG8yhjzQqErbg63N6KJA4DHqha113tjKDpGEwS5x1dT2KfLSbSJ'
    )
  })

  it('should properly compute change address', async () => {
    assert.equal(
      await wallets.used.getChangeAddress(5),
      'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E'
    )
  })

  it('should properly compute change address for v2 derivation scheme', async () => {
    assert.equal(
      await wallets.v2Used.getChangeAddress(5),
      'Ae2tdPwUPEZ8gWGpNQAfqeTcTXai47wQ3bmjpYcmaE8Dcr2eSpV3VwzjAxC'
    )
  })
})

describe('test fetching wallet addresses', () => {
  it('should properly fetch list of wallet addresses with metadata', async () => {
    const addresses = await wallets.used.getVisibleAddressesWithMeta()

    assert.equal(
      addresses[4].address,
      'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu'
    )
    assert.equal(addresses[4].bip32StringPath, "m/0'/4'")
  })
  it('should properly fetch list of v2 wallet addresses with metadata', async () => {
    const addresses = await wallets.v2Used.getVisibleAddressesWithMeta()

    assert.equal(
      addresses[4].address,
      'Ae2tdPwUPEYyLw6UJRKnbbudG8PJR7KfPhioRW8m1BohkFAqR44pPg6BYVZ'
    )
    assert.equal(addresses[4].bip32StringPath, "m/44'/1815'/0'/0/4")
  })
})

describe('address ownership verification', () => {
  const ownAddress =
    'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E'

  it('should accept own address', async () => {
    assert.equal(await wallets.used.isOwnAddress(ownAddress), true)
  })

  const derivableAddress =
    'DdzFFzCqrhswDJWtwkzM2P9qgzXz5bw1hqt8YYERhTLTWoKRfUL8jxZUJxuRxZGRV3NxAPpoeGptXxkYT5pFWMk2DLZ4jbHH3wmYqDCR'
  it('should reject derivable address not generated by AdaLite', async () => {
    assert.equal(await wallets.used.isOwnAddress(derivableAddress), false)
  })

  const foreignAddress =
    'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdH448P44Y'
  it('should reject foreign address', async () => {
    assert.equal(await wallets.used.isOwnAddress(foreignAddress), false)
  })
})

describe('successful transaction fee computation', () => {
  it('should compute the right transaction fee for given transaction', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockBulkAddressSummaryEndpoint()
    mockNet.mockUtxoEndpoint()

    assert.equal(await wallets.used.getTxFee(myAddress, 47), 179288)
    mockNet.clean()
  })

  it('should compute the right transaction fee for shorter outgoing address', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()

    assert.equal(await wallets.used.getTxFee(shortAddress, 47), 177838)
    mockNet.clean()
  })
})

describe('max sendable amount computation', () => {
  it('should properly compute max sendable amount', async () => {
    const mockNet = mockNetwork(mockConfig1)
    mockNet.mockUtxoEndpoint()

    const maxSendableAmount = await wallets.smallUtxos.getMaxSendableAmount(myAddress)

    assert.equal(maxSendableAmount, 1324447)
    mockNet.clean()
  })
})

describe('transaction serialization', () => {
  it('should properly serialize transaction before signing', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()

    const txAux = await wallets.used.prepareTxAux(myAddress, 47)

    // transaction serialization before providing witnesses
    const txAuxSerialized = cbor.encode(txAux).toString('hex')
    const expectedtxAuxSerialized =
      '839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cab41e66f954dd7f1c16081755eb02ee61dc720bd9e05790f9de649b7a101581e581c140539c64edded60a7f2d169cb4da86a47bccc6a92e4130754fd0f36001a306ccb8f1a002a8c6cffa0'

    assert.equal(txAuxSerialized, expectedtxAuxSerialized)
    mockNet.clean()
  })

  it('should properly discard utxos that cause an increase of fee higher than their value', async () => {
    const mockNet = mockNetwork(mockConfig1)
    mockNet.mockUtxoEndpoint()

    const txAux = await wallets.smallUtxos.prepareTxAux(myAddress, 1000000)

    assert.equal(txAux.inputs.length, 2)
    mockNet.clean()
  })

  it('should properly compute transaction hash', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()

    const txAux = await wallets.used.prepareTxAux(myAddress, 47)
    const expectedTxHash = '73131c773879e7e634022f8e0175399b7e7814c42684377cf6f8c7a1adb23112'

    assert.equal(txAux.getId(), expectedTxHash)
    mockNet.clean()
  })

  it('should properly serialize the whole transaction', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()
    mockNet.mockRawTxEndpoint()
    mockNet.mockBulkAddressSummaryEndpoint()

    const tx = await wallets.used.prepareSignedTx(myAddress, 47)

    const expectedTxBody =
      '82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cab41e66f954dd7f1c16081755eb02ee61dc720bd9e05790f9de649b7a101581e581c140539c64edded60a7f2d169cb4da86a47bccc6a92e4130754fd0f36001a306ccb8f1a002a8c6cffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840951e97f421d44345f260f5d84070c93a0dbc7dfa883a2cbedb1cedee22cb86b459450d615d580d9a3bd49cf09f2848447287cf306f09115d831276cac42919088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840f44da425f699c39ca539c6e2e2262ed4a4b977dd8bdbb4450d40ab7503dc9b4ebca68a8f819d1f92bfdd2af2825b26bb07ef1f586c1135a88b1cdc8520142208'

    assert.equal(tx.txBody, expectedTxBody)
    mockNet.clean()
  })

  it('should properly get new unspent outputs from (submitted) transaction', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()
    mockNet.mockRawTxEndpoint()

    const mockTxAux = TxAux(
      [
        {
          txHash: '64da0b0105f66a6b57fd1a121010dcf9b1fdc52591544a466f1ed6b17def1403',
          outputIndex: 0,
          utxo: {
            type: 0,
            txHash: '64da0b0105f66a6b57fd1a121010dcf9b1fdc52591544a466f1ed6b17def1403',
            outputIndex: 0,
          },
        },
      ],
      [
        {
          address:
            'DdzFFzCqrht8R6C8JwqnqkntNZFgUd2XRgWHGEKkqBH781cRDXmd8MTn7xS5FkVPLVVZ46PxVLJEmhDF6vUjYEgXwMPxsFiKzx7rsrhz',
          coins: 100000,
          isChange: false,
        },
        {
          address:
            'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
          coins: 228666,
          isChange: false,
        },
      ],
      {}
    )

    const newUtxos = await wallets.used._getNewUtxosFromTxAux(mockTxAux)

    assert.equal(newUtxos.length, 1)
    assert.equal(
      newUtxos[0].address,
      'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E'
    )
    assert.equal(newUtxos[0].outputIndex, 1)
    mockNet.clean()
  })
})

describe('test transaction submission', () => {
  it('should properly submit transaction', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()
    mockNet.mockTransactionSubmitter()
    mockNet.mockRawTxEndpoint()

    const signedTx = await wallets.used.prepareSignedTx(myAddress, 47)
    const result = await wallets.used.submitTx(signedTx)

    assert.deepEqual(result, {
      txHash: '73131c773879e7e634022f8e0175399b7e7814c42684377cf6f8c7a1adb23112',
    })
    mockNet.clean()
  })
})
