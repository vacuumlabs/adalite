const assert = require('assert')
const cbor = require('cbor')

const {HARDENED_THRESHOLD} = require('../../frontend/wallet/constants')
const CardanoWalletSecretCryptoProvider = require('../../frontend/wallet/cardano-wallet-secret-crypto-provider')
const tx = require('../../frontend/wallet/transaction')
const range = require('../../frontend/wallet/helpers/range')
const mnemonicOrHdNodeStringToWalletSecret = require('../../frontend/wallet/helpers/mnemonicOrHdNodeStringToWalletSecret')

const cryptoProviderSettings = [
  {
    secret: 'cruise bike bar reopen mimic title style fence race solar million clean',
    network: 'mainnet',
  },
  {
    secret: 'logic easily waste eager injury oval sentence wine bomb embrace gossip supreme',
    network: 'mainnet',
  },
  {
    secret:
      'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3',
    network: 'mainnet',
  },
  {
    secret:
      'cost dash dress stove morning robust group affair stomach vacant route volume yellow salute laugh',
    network: 'mainnet',
  },
]
const cryptoProviders = []

const initCryptoProvider = async (settings, i) => {
  const parsedWalletSecret = await mnemonicOrHdNodeStringToWalletSecret(settings.secret)

  cryptoProviders[i] = CardanoWalletSecretCryptoProvider(
    {
      derivationScheme: parsedWalletSecret.derivationScheme,
      walletSecret: parsedWalletSecret.walletSecret,
      network: settings.network,
    },
    true
  )
}

before(async () => await Promise.all(cryptoProviderSettings.map(initCryptoProvider)))

const childIndex2 = 0xf9745151
const childIndex3 = 0x10000323

describe('signing', () => {
  const message = Buffer.from(
    '011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950',
    'hex'
  )
  const expectedMessageSignature = Buffer.from(
    '104aa67d10c5ad01dc958a8ff07b29640cf1005de274d68fb8eb763e7754315248d9c7b7c494acce1887f071f349ff74568fb33125df23aa05d8a3d366a43303',
    'hex'
  )

  it('should produce proper signature', async () => {
    // test signing
    assert.equal(
      Buffer.compare(
        await cryptoProviders[0]._sign(message, [HARDENED_THRESHOLD, HARDENED_THRESHOLD + 1]),
        expectedMessageSignature
      ),
      0
    )
  })
})

describe('secret key derivation', () => {
  // some hardened secret key - child index starts with 1 in binary
  const expectedHdNodeStr1 =
    'ffd89a6ecc943cd58766294e7575d20f775eba62a93361412d61718026781c00d3d86147df3aa92147ea48f786b2cd2bd7d756d37add3055caa8ba4f1d543198b79060c204436cfb0a660a25a43d3b80bd10a167dacb70e0a9d1ca424c8259e7f0bd12bacfb4f58697cd088f6531130584933aed7dfe53163b7f24f10e6c25da'
  it('should properly derive some hardened secret key - child index starts with 1 in binary', () => {
    const derivedHdNodeStr1 = cryptoProviders[2]
      ._deriveHdNodeFromRoot([HARDENED_THRESHOLD, childIndex2])
      .toString()
    assert.equal(derivedHdNodeStr1, expectedHdNodeStr1)
  })

  const expectedHdNodeStr2 =
    'e0f31d972365bb76a2dd837c7ba5b4b7c065fa4ad1fbf808ddc17130bf10c40f63772cbaa1cdf7e847543f3cbcb3da7065498c71c04ca1f5cd9dccc18226461efdade44a3c35cfb6ab9c834dbc418da2cba30501139db384f194ef060847d0bd164f072124bcf55af0f01c1b5cd7759a7262b4d205717f4afb282cf98fed3026'
  it('should properly derive some nonhardened secret key - child index starts with 0 in binary', () => {
    const derivedHdNodeStr2 = cryptoProviders[2]
      ._deriveHdNodeFromRoot([HARDENED_THRESHOLD, childIndex3])
      .toString()
    assert.equal(derivedHdNodeStr2, expectedHdNodeStr2)
  })
})

describe('address generation from secret key', () => {
  const expectedAddress1 = 'Ae2tdPwUPEZLdysXE34s6xRCpqSHvy5mRbrQiegSVQGQFBvkXf5pvseKuzH'
  it("should properly generate root public address (the one used as 'wallet id' in Daedalus)", async () => {
    const derivedAddress1 = await cryptoProviders[2].deriveAddress([], 'hardened')
    assert.equal(derivedAddress1, expectedAddress1)

    const derivedAddress2 = await cryptoProviders[2].deriveAddress([], 'nonhardened')
    assert.equal(derivedAddress2, expectedAddress1)
  })

  const expectedAddress2 =
    'DdzFFzCqrht5AaL5KGUxfD7sSNiGNmz6DaUmmRAmXApD6yjNy6xLNq1KsXcMAaQipKENnxYLy317KZzSBorB2dEMuQcS5z8AU9akLaMm'
  it('should properly generate some address from hardened key - child index starts with 1 in binary', async () => {
    const derivedAddress2 = await cryptoProviders[2].deriveAddress(
      [HARDENED_THRESHOLD, childIndex2],
      'hardened'
    )
    assert.equal(derivedAddress2, expectedAddress2)
  })

  const expectedAddress3 =
    'DdzFFzCqrhsf6sUbywd6FfZHfvmkT7drL7MLzs5KkvfSpTNLExLHhhwmuKdAajnHE3cebNPPkfyUYpoqgEV7ktDLUHF5dV41eWSMh6VU'
  it('should properly generate some address from nonhardened key in hardened mode - child index starts with 0 in binary', async () => {
    const derivedAddress3 = await cryptoProviders[2].deriveAddress(
      [HARDENED_THRESHOLD, childIndex3],
      'hardened'
    )
    assert.equal(derivedAddress3, expectedAddress3)
  })

  it('should properly generate some address from nonhardened key in nonhardened mode - child index starts with 0 in binary', async () => {
    const derivedAddress3 = await cryptoProviders[2].deriveAddress(
      [HARDENED_THRESHOLD, childIndex3],
      'nonhardened'
    )
    assert.equal(derivedAddress3, expectedAddress3)
  })
})

describe('wallet addresses derivation scheme V1', () => {
  const expectedWalletAddresses = [
    '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',
  ]

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const derivationPaths = range(HARDENED_THRESHOLD + 1, HARDENED_THRESHOLD + 21).map((i) => [
      HARDENED_THRESHOLD,
      i,
    ])
    const walletAddresses = await cryptoProviders[2].deriveAddresses(derivationPaths, 'hardened')
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('wallet addresses derivation scheme V2', () => {
  const expectedWalletAddresses = [
    'Ae2tdPwUPEZ6RUCnjGHFqi59k5WZLiv3HoCCNGCW8SYc5H9srdTzn1bec4W',
    'Ae2tdPwUPEZ7dnds6ZyhQdmgkrDFFPSDh8jG9RAhswcXt1bRauNw5jczjpV',
    'Ae2tdPwUPEZ8LAVy21zj4BF97iWxKCmPv12W6a18zLX3V7rZDFFVgqUBkKw',
    'Ae2tdPwUPEZ7Ed1V5G9oBoRoK3sbgFU8b9iZY2kegf4s6228EwVLRSq9NzP',
    'Ae2tdPwUPEYyLw6UJRKnbbudG8PJR7KfPhioRW8m1BohkFAqR44pPg6BYVZ',
    'Ae2tdPwUPEYw9wMWUnyutGYXdpVqNStf4g3TAxiAYMyACQAWXNFvs3fZ8do',
    'Ae2tdPwUPEZ9wMYpKKXJLAEa5JV2CKBoiFvKfuqdtDLMARkaZG9P4K7ZRjX',
    'Ae2tdPwUPEZHAZxwzS7MrSS8nc6DXt4Nj8FvrYHXCVDkzVEjrAfVxxZEL4H',
    'Ae2tdPwUPEYz8hGBRWCNJFm2bDuSHBbphMT32wPxALXTVPWrRCtZhSPbRen',
    'Ae2tdPwUPEZHxx6ug6oyXREcwQ1tjBY4D2B6M7rYL9LhbAXfRPfMtm3nV4J',
  ]

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const derivationPaths = range(0, 10).map((i) => [HARDENED_THRESHOLD, 0, i])
    const walletAddresses = await cryptoProviders[3].deriveAddresses(derivationPaths, 'hardened')
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('checking input integrity', () => {
  const rawTxBody = Buffer.from(
    '839f8200d8185824825820aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c008200d8185824825820aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c01ff9f8282d818584283581c2cdf2a4727c91392bcd1dc1df64e4b5a3a3ddb5645226616b651b90aa101581e581c140539c64edded60a7f2d3693300e8b2463207803127d23562295bf3001a5562e2a21a000186a08282d818584283581cfcca7f1da7a330be2cb4ff273e3b8e2bd77c3cdcd3e8d8381e0d9e49a101581e581c140539c64edded60a7f2de696f5546c042bbc8749c95e836b09b7884001aead6cd071a002bc253ffa0',
    'hex'
  )
  const input1correct = tx.TxInputFromUtxo({
    txHash: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
    address:
      'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
    coins: 100000,
    outputIndex: 0,
  })

  const input2correct = tx.TxInputFromUtxo({
    txHash: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
    address:
      'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
    coins: 2867795,
    outputIndex: 1,
  })

  const input1wrongHash = tx.TxInputFromUtxo({
    txHash: 'aaaafde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2745',
    address:
      'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
    coins: 100000,
    outputIndex: 0,
  })

  const input1wrongCoins = tx.TxInputFromUtxo({
    txHash: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
    address:
      'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
    coins: 110000,
    outputIndex: 0,
  })

  it('should properly check unspent output coin amount with raw input transaction data', () => {
    const txInputs = [input1correct, input2correct]

    assert.equal(cryptoProviders[2]._checkTxInputsIntegrity(txInputs, [rawTxBody]), true)
  })

  it('should reject input integrity based on wrong txHash provided', () => {
    const txInputs = [input1wrongHash, input2correct]

    assert.equal(cryptoProviders[2]._checkTxInputsIntegrity(txInputs, [rawTxBody]), false)
  })

  it('should reject input integrity based on wrong coin amount provided', () => {
    const txInputs = [input1wrongCoins, input2correct]

    assert.equal(cryptoProviders[2]._checkTxInputsIntegrity(txInputs, [rawTxBody]), false)
  })
})

describe('transaction signing', () => {
  it('should properly compute transaction witnesses', async () => {
    const txInputs = [
      tx.TxInputFromUtxo({
        txHash: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
        address:
          'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
        coins: 100000,
        outputIndex: 0,
      }),
      tx.TxInputFromUtxo({
        txHash: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
        address:
          'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
        coins: 2867795,
        outputIndex: 1,
      }),
    ]

    const txOutputs = [
      tx.TxOutput(
        'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
        47,
        false
      ),
      tx.TxOutput(
        'DdzFFzCqrht5CupPRNPoukz3K1FD7TvYeSXbbM3oPvmmmLTSsbGzKHHypKNqtSXqVyvpBwqUw3vpRXYhpkbaLKkHw5qUEHr2v7h7Roc7',
        2788855,
        true
      ),
    ]

    const txAux = tx.TxAux(txInputs, txOutputs, {})
    const txSignedStructured = await cryptoProviders[1]._signTxGetStructured(txAux)

    const witnessesSerialized = cbor.encode(txSignedStructured.witnesses).toString('hex')

    const expectedWitnessesSerialized =
      '828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840407b76b983b657b1dde00a9c90ca97d1f8310b088146fbe2997849747d4e3a633be8b037c56e7b7190e8be7902a01d0faea31f45d42534c3e735faa437925b088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840607573290ca775a7a953c9b63b91a66da9178751bf26caafaab7bbc2390dab260dc8049cd0f3fd24ee7db71dd82ec23e0280b3fcd35b6eee3fb9eb9c2b8c2d0f'

    assert.equal(witnessesSerialized, expectedWitnessesSerialized)
  })
})
