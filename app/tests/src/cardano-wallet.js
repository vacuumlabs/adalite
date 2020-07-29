import assert from 'assert'
import cbor from 'borc'

import {CardanoWallet} from '../../frontend/wallet/cardano-wallet'
import CryptoProviderFactory from '../../frontend/wallet/byron/crypto-provider-factory'
import {txFeeFunction} from '../../frontend/wallet/byron/byron-tx-planner'

import mockNetwork from './common/mock'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {CRYPTO_PROVIDER_TYPES, NETWORKS} from '../../frontend/wallet/constants'

const testSeed = 39

const mockConfig1 = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_DEFAULT_ADDRESS_COUNT: 5,
  ADALITE_GAP_LIMIT: 20,
}

const mockConfig2 = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_DEFAULT_ADDRESS_COUNT: 15,
  ADALITE_GAP_LIMIT: 20,
}

const unusedWalletConfig = {
  cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
  mnemonic: 'rain flame hip basic extend capable chair oppose gorilla fun aunt emotion',
  config: mockConfig1,
  randomInputSeed: testSeed,
  randomChangeSeed: testSeed,
  network: NETWORKS.BYRON.MAINNET,
}

const usedWalletConfig = {
  cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
  mnemonic: 'logic easily waste eager injury oval sentence wine bomb embrace gossip supreme',
  config: mockConfig2,
  randomInputSeed: testSeed,
  randomChangeSeed: testSeed,
  network: NETWORKS.BYRON.MAINNET,
}

const smallUtxosWalletConfig = {
  cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
  mnemonic: 'blame matrix water coil diet seat nerve street movie turkey jump bundle',
  config: mockConfig1,
  randomInputSeed: testSeed,
  randomChangeSeed: testSeed,
  network: NETWORKS.BYRON.MAINNET,
}

const usedV2WalletConfig = {
  cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
  mnemonic:
    'cost dash dress stove morning robust group affair stomach vacant route volume yellow salute laugh',
  config: mockConfig1,
  randomInputSeed: testSeed,
  randomChangeSeed: testSeed,
  network: NETWORKS.BYRON.MAINNET,
}

const wallets = {}

const initWallet = async (id, config) => {
  const walletSecretDef = await mnemonicToWalletSecretDef(config.mnemonic)

  const cryptoProvider = await CryptoProviderFactory.getCryptoProvider(config.cryptoProviderType, {
    walletSecretDef,
    network: config.network,
  })

  const wallet = await CardanoWallet({
    cryptoProvider,
    config: config.config,
    randomInputSeed: config.randomInputSeed,
    randomChangeSeed: config.randomChangeSeed,
  })

  wallets[id] = wallet
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
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockBulkAddressSummaryEndpoint()

    assert.equal(
      await wallets.unused.getChangeAddress(),
      'DdzFFzCqrhssmYoG5Eca1bKZFdGS8d6iag1mU4wbLeYcSPVvBNF2wRG8yhjzQqErbg63N6KJA4DHqha113tjKDpGEwS5x1dT2KfLSbSJ'
    )

    mockNet.clean()
  })

  it('should properly compute change address', async () => {
    assert.equal(
      await wallets.used.getChangeAddress(),
      'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC'
    )
  })

  it('should properly compute change address for v2 derivation scheme', async () => {
    assert.equal(
      await wallets.v2Used.getChangeAddress(),
      'Ae2tdPwUPEYwJN7vyddNCKjFUEdFV5kuaJvwCgVjqSUKCyoayKvDVdx2V2d'
    )
  })
})

describe('test fetching wallet addresses', () => {
  it('should properly fetch list of wallet addresses with metadata', async () => {
    const addresses = await wallets.used.getVisibleAddresses()

    assert.equal(
      addresses[4].address,
      'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu'
    )
    assert.equal(addresses[4].bip32StringPath, "m/0'/4'")
  })
  it('should properly fetch list of v2 wallet addresses with metadata', async () => {
    const addresses = await wallets.v2Used.getVisibleAddresses()

    assert.equal(
      addresses[4].address,
      'Ae2tdPwUPEYyLw6UJRKnbbudG8PJR7KfPhioRW8m1BohkFAqR44pPg6BYVZ'
    )
    assert.equal(addresses[4].bip32StringPath, "m/44'/1815'/0'/0/4")
  })
})

describe('successful transaction fee computation', () => {
  it('should compute the right transaction fee for given transaction', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockBulkAddressSummaryEndpoint()
    mockNet.mockUtxoEndpoint()

    assert.equal(
      (await wallets.used.getTxPlan({address: myAddress, coins: 47, donationAmount: 0})).fee,
      179288
    )
    mockNet.clean()
  })

  it('should compute the right transaction fee for shorter outgoing address', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()

    assert.equal(
      (await wallets.used.getTxPlan({address: shortAddress, coins: 47, donationAmount: 0})).fee,
      177838
    )
    mockNet.clean()
  })
})

describe('max sendable amount computation', () => {
  it('should properly compute max sendable amount', async () => {
    const mockNet = mockNetwork(mockConfig1)
    mockNet.mockUtxoEndpoint()
    mockNet.mockBulkAddressSummaryEndpoint()

    const maxAmounts = await wallets.smallUtxos.getMaxSendableAmount(myAddress, false)

    assert.equal(maxAmounts.sendAmount, 1324447)
    mockNet.clean()
  })
})

describe('transaction serialization', () => {
  it('should properly serialize transaction before signing', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()
    const plan = await wallets.used.getTxPlan({address: myAddress, coins: 47, donationAmount: 0})
    const txAux = wallets.used.prepareTxAux(plan)

    // transaction serialization before providing witnesses
    const txAuxSerialized = cbor.encode(txAux).toString('hex')
    const expectedtxAuxSerialized =
      '839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cf9a5257f805a1d378c87b0bfb09232c10d9098bc56fd21d9a6a4072aa101581e581c140539c64edded60a7f2c4692c460a154cbdd06088333fd7f75ea7e7001a0ff80ab91a002a8c6cffa0'

    assert.equal(txAuxSerialized, expectedtxAuxSerialized)
    mockNet.clean()
  })

  it('should properly discard utxos that cause an increase of fee higher than their value', async () => {
    const mockNet = mockNetwork(mockConfig1)
    mockNet.mockUtxoEndpoint()
    mockNet.mockBulkAddressSummaryEndpoint()

    const plan = await wallets.smallUtxos.getTxPlan({
      address: myAddress,
      coins: 1000000,
      donationAmount: 0,
    })
    const txAux = wallets.smallUtxos.prepareTxAux(plan)

    assert.equal(txAux.inputs.length, 2)
    mockNet.clean()
  })

  it('should properly compute transaction hash', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()

    const plan = await wallets.used.getTxPlan({address: myAddress, coins: 47, donationAmount: 0})
    const txAux = await wallets.used.prepareTxAux(plan)

    const expectedTxHash = '5e3c57744fb9b134589cb006db3d6536cd6471a2bde542149326dd92859f0a93'

    assert.equal(txAux.getId(), expectedTxHash)
    mockNet.clean()
  })

  it('should properly serialize the whole transaction', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()
    mockNet.mockRawTxEndpoint()
    mockNet.mockBulkAddressSummaryEndpoint()

    const wallet = wallets.used

    const tx = await wallet
      .getTxPlan({address: myAddress, coins: 47, donationAmount: 0})
      .then(wallet.prepareTxAux)
      .then(wallet.signTxAux)

    const expectedTxBody =
      '82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cf9a5257f805a1d378c87b0bfb09232c10d9098bc56fd21d9a6a4072aa101581e581c140539c64edded60a7f2c4692c460a154cbdd06088333fd7f75ea7e7001a0ff80ab91a002a8c6cffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840337f577d102af20120ade17d54821b1e40a218ddf9ca29dd4fd46f7394b0c7d9abc6c4d9ac46d592c83dea1d31465665614b7198c4ceef00632e6b48e13490088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840982ffc1339a390bbd26948ab64fd6510f557e9c7cb04e665dd168797822e156335affdce50e08831b6532304450e4e490d805b9ed184b7f6ce64107b0b16c102'

    assert.equal(tx.txBody, expectedTxBody)
    mockNet.clean()
  })
})

describe('test transaction submission', () => {
  it('should properly submit transaction', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockUtxoEndpoint()
    mockNet.mockTransactionSubmitter()
    mockNet.mockRawTxEndpoint()

    const wallet = wallets.used
    const tx = await wallet
      .getTxPlan({address: myAddress, coins: 47, donationAmount: 0})
      .then(wallet.prepareTxAux)
      .then(wallet.signTxAux)

    const result = await wallet.submitTx(tx)

    assert.deepEqual(result, {
      txHash: '5e3c57744fb9b134589cb006db3d6536cd6471a2bde542149326dd92859f0a93',
    })
    mockNet.clean()
  })
})

describe('filtering visible addresses', () => {
  it('should properly filter unused ending addresses of v1 wallet', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockBulkAddressSummaryEndpoint()

    const result = await wallets.used.getVisibleAddresses()
    assert.equal(result.length, 17)

    mockNet.clean()
  })
  it('should properly filter unused ending addresses of v2 wallet', async () => {
    const mockNet = mockNetwork(mockConfig2)
    mockNet.mockBulkAddressSummaryEndpoint()

    const result = await wallets.v2Used.getVisibleAddresses()
    assert.equal(result.length, 31)

    mockNet.clean()
  })
})
