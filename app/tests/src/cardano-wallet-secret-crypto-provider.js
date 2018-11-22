const assert = require('assert')
const cbor = require('cbor')

const {HARDENED_THRESHOLD} = require('../../frontend/wallet/constants')
const derivationSchemes = require('../../frontend/wallet/derivation-schemes')
const CardanoWalletSecretCryptoProvider = require('../../frontend/wallet/cardano-wallet-secret-crypto-provider')
const tx = require('../../frontend/wallet/transaction')
const mnemonicOrHdNodeStringToWalletSecret = require('../../frontend/wallet/helpers/mnemonicOrHdNodeStringToWalletSecret')
const cryptoProviderSettings = require('./common/crypto-provider-settings')

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
    const addressToAbsPathMapper = (addr) => {
      const mapping = {
        // eslint-disable-next-line max-len
        DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5: derivationSchemes.v1.toAbsoluteDerivationPath(
          [2147483648, 0, 2147483655]
        ),
        // eslint-disable-next-line max-len
        DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz: derivationSchemes.v1.toAbsoluteDerivationPath(
          [2147483648, 0, 2147483658]
        ),
      }

      return mapping[addr]
    }

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
    const txSignedStructured = await cryptoProviders[1]._signTxGetStructured(
      txAux,
      addressToAbsPathMapper
    )

    const witnessesSerialized = cbor.encode(txSignedStructured.witnesses).toString('hex')

    const expectedWitnessesSerialized =
      '828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840407b76b983b657b1dde00a9c90ca97d1f8310b088146fbe2997849747d4e3a633be8b037c56e7b7190e8be7902a01d0faea31f45d42534c3e735faa437925b088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840607573290ca775a7a953c9b63b91a66da9178751bf26caafaab7bbc2390dab260dc8049cd0f3fd24ee7db71dd82ec23e0280b3fcd35b6eee3fb9eb9c2b8c2d0f'

    assert.equal(witnessesSerialized, expectedWitnessesSerialized)
  })
})
