// using nodejs's build in asserts that throw on failure
const assert = require('assert')
const cbor = require('cbor')

const transaction = require('../transaction')
const mnemonic = require('../mnemonic')
const address = require('../address')
const {CardanoWallet, txFeeFunction} = require('../cardano-wallet')
const {mockTransactionSubmitter, mockBlockChainExplorer, mockRandomNumberGenerator} = require('./mock')

const secret1 = new transaction.WalletSecretString(
  '50f26a6d0e454337554274d703033c21a06fecfcb0457b15214e41ea3228ac51e2b9f0ca0f6510cfdd24325ac6676cdd98a9484336ba36c876fd93aa439d8b72eddaef2fab3d1412ea1f2517b5a50439c28c27d6aefafce38f9290c17e1e7d56c532f2e7a6620550b32841a24055e89c02256dec21d1f4418004ffc9591a8e9c'
)
const secret2 = new transaction.WalletSecretString(
  'a859bcad5de4fd8df3f3bfa24793dba52785f9a98832300844f028ff2dd75a5fcd24f7e51d3a2a72ac85cc163759b1103efb1d685308dcc6cd2cce09f70c948501e949b5b7a72f1ad304f47d842733b3481f2f096ca7ddfe8e1b7c20a1acafbb66ee772671d4fef6418f670e80ad44d1747a89d75a4ad386452ab5dc1acc32b3'
)
const wallet = CardanoWallet(
  'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3'
)
const childIndex1 = 0x80000000
const childIndex2 = 0xf9745151
const childIndex3 = 0x10000323
const message = '011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950'
const signature =
  'ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dea8eb8bae46a1824f62fb80cc3b65aff02'
const myAddress =
  'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY'
const history = [
  {
    ctbId: '1ce7a1e2606271a7f085262fb7c509c98d60912a943c9be3871ac3ace48ae6d6',
    ctbTimeIssued: 1520526191,
    ctbInputs: [
      [
        'DdzFFzCqrhsjWQpNmu9QWV89P4UDjbha5wAeasKevqTuv7bf2DpNmdXTh5xQJKJftgWWyNQg242YErYXbuM3yagzsGJdpescQPihJJmr',
        {getCoin: '18829106'},
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhszkkEYCCAutkxJkX82CWEsXYqNsVz4mLvL8c87PwbuwUsKM4dcDe7WodJtrsJdv4yRzHMKU2LyBb2yUxtMB1ifqBAYYjKt',
        {getCoin: '18158212'},
      ],
      [
        'DdzFFzCqrhssuRDi1EGGjCajnyTGqA3HVFownbkTA9M9638Ro3o8CGyZN5NFNQMaHAbhnZgevHqoCwghoq9aScHyoWptamKzwQK7RWFw',
        {getCoin: '500000'},
      ],
    ],
    ctbInputSum: {getCoin: '18829106'},
    ctbOutputSum: {getCoin: '18658212'},
    effect: 500000,
  },
  {
    ctbId: '14fab8b89cc003da76c147af4ce3619bc36f7064b69f48b7fbad63673753f351',
    ctbTimeIssued: 1520526111,
    ctbInputs: [
      [
        'DdzFFzCqrhswKekq5Ysev3wL15MndorSfEF82TV5dxHihGjjVweXvmkza4zGnQj3jkvrobwFTnoBpxqes447eVbUDopk3NpLAcQnmfdF',
        {getCoin: '20000000'},
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhsjWQpNmu9QWV89P4UDjbha5wAeasKevqTuv7bf2DpNmdXTh5xQJKJftgWWyNQg242YErYXbuM3yagzsGJdpescQPihJJmr',
        {getCoin: '18829106'},
      ],
      [
        'DdzFFzCqrhsgeBwYfYqJojCSPquZVLVoqAWjoBXsxCE9gJ44881GzVXMverRYLBU5KeArqW3EPThfeucWj1UzBU49c2e87dkdVaVSZ3s',
        {getCoin: '1000000'},
      ],
    ],
    ctbInputSum: {getCoin: '20000000'},
    ctbOutputSum: {getCoin: '19829106'},
    effect: 1000000,
  },
]

describe('test generating mnemonic', () => {
  const mnemonicString = mnemonic.generateMnemonic()

  it('should produce 12 words', () => {
    assert.equal(mnemonicString.split(' ').length, 12)
  })
})

describe('test signing', () => {
  it('should produce proper signature', () => {
    // test signing
    assert.equal(transaction.sign(message, secret1), signature)
  })
})

describe('test signature verification', () => {
  const wrongSignature =
    'ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dff8eb8bae46a1824f62fb80cc3b65aff02'

  it('should accept signature', () => {
    assert.equal(transaction.verify(message, secret1.getPublicKey(), signature), true)
  })

  it('should reject signature', () => {
    assert.equal(transaction.verify(message, secret1.getPublicKey(), wrongSignature), false)
  })
})

describe('test secret key derivation from mnemonic', () => {
  // a test case where the hash seed has an odd number of bytes
  const mnemonicString1 = 'cruise bike bar reopen mimic title style fence race solar million clean'
  const generatedWalletSecret1 = mnemonic.mnemonicToWalletSecretString(mnemonicString1).secretString
  const expectedWalletSecret1 =
    'b0d4187b81b5c2fb8234378ebcf33a1c2e2293369bd2263b6dcf672a29676a5a2e73d1f6e660365eacdde77052625f0cc6e50c0710b35e45095fb1b51b9b9315f83d8464268bbb19fe416000fa846eaed7171d4390242aa966ab80c36694b7fa6eec090fd6c6498bb4a28b61f8c4c5ae19b635e20052cb0bc7e0d17404b1717e'
  it('should produce right secret key from a seed which had a leading zero in hex by stripping it', () => {
    assert.equal(generatedWalletSecret1, expectedWalletSecret1)
  })

  // a test case where the hash seed has an even number of bytes
  const mnemonicString2 =
    'useful normal dismiss what earn total boost project tomorrow filter pill shuffle'
  const expectedWalletSecret2 =
    '30582ede015798e511207cb26d71ca460edb85a16fafe212261039eeaccd434fab1c009a83260352b8cf80241d097696d898b7a0a0296312227bb459c3784cc12770c30533d63e77ad46c26a47c1d659058ab0c3dcf0e899e40113e7def05dd73fc6f8b25d9d774caebaed348f8e1a7d503c958e0cf74337e95d1d5e4a2d4aa0'
  const generatedWalletSecret2 = mnemonic.mnemonicToWalletSecretString(mnemonicString2).secretString
  it('should produce right secret key from a seed without a leading zero in hex', () => {
    assert.equal(generatedWalletSecret2, expectedWalletSecret2)
  })
})

describe('test private key derivation', () => {
  // root public secret key (the one used as 'wallet id' in Daedalus)
  const expectedSecret1 =
    '28e375ee5af42a9641c5c31b1b2d24df7f1d2212116bc0b0fc58816f06985b072cf5960d205736cac2e8224dd6018f7223c1bdc630d2b866703670a37316f44003b5417131136bd53174f09b129ae0499bd718ca55c5d40877c33b5ee10e5ba89661f96070a9d39df75c21f6142415502e254523cbacff2b4d58aa87d9021d65'
  it("should properly derive root public secret key (the one used as 'wallet id' in Daedalus)", () => {
    const derivedSecret1 = address.deriveSK(secret2, childIndex1).secretString
    assert.equal(derivedSecret1, expectedSecret1)
  })

  // some hardened secret key - child index starts with 1 in binary
  const expectedSecret2 =
    'ffd89a6ecc943cd58766294e7575d20f775eba62a93361412d61718026781c00d3d86147df3aa92147ea48f786b2cd2bd7d756d37add3055caa8ba4f1d543198b79060c204436cfb0a660a25a43d3b80bd10a167dacb70e0a9d1ca424c8259e7f0bd12bacfb4f58697cd088f6531130584933aed7dfe53163b7f24f10e6c25da'
  it('should properly derive some hardened secret key - child index starts with 1 in binary', () => {
    const derivedSecret2 = address.deriveSK(secret2, childIndex2).secretString
    assert.equal(derivedSecret2, expectedSecret2)
  })

  const expectedSecret3 =
    'e0f31d972365bb76a2dd837c7ba5b4b7c065fa4ad1fbf808ddc17130bf10c40f63772cbaa1cdf7e847543f3cbcb3da7065498c71c04ca1f5cd9dccc18226461efdade44a3c35cfb6ab9c834dbc418da2cba30501139db384f194ef060847d0bd164f072124bcf55af0f01c1b5cd7759a7262b4d205717f4afb282cf98fed3026'
  it('should properly derive some nonhardened secret key - child index starts with 0 in binary', () => {
    const derivedSecret3 = address.deriveSK(secret2, childIndex3).secretString
    assert.equal(derivedSecret3, expectedSecret3)
  })
})

describe('test address generation from secret key', () => {
  const expectedAddress1 = 'Ae2tdPwUPEZLdysXE34s6xRCpqSHvy5mRbrQiegSVQGQFBvkXf5pvseKuzH'
  it("should properly generate root public address (the one used as 'wallet id' in Daedalus)", () => {
    const derivedAddress1 = address.deriveAddressAndSecret(secret2, childIndex1).address
    assert.equal(derivedAddress1, expectedAddress1)
  })

  const expectedAddress2 =
    'DdzFFzCqrht5AaL5KGUxfD7sSNiGNmz6DaUmmRAmXApD6yjNy6xLNq1KsXcMAaQipKENnxYLy317KZzSBorB2dEMuQcS5z8AU9akLaMm'
  it('should properly generate some address from hardened key - child index starts with 1 in binary', () => {
    const derivedAddress2 = address.deriveAddressAndSecret(secret2, childIndex2).address
    assert.equal(derivedAddress2, expectedAddress2)
  })

  const expectedAddress3 =
    'DdzFFzCqrhsf6sUbywd6FfZHfvmkT7drL7MLzs5KkvfSpTNLExLHhhwmuKdAajnHE3cebNPPkfyUYpoqgEV7ktDLUHF5dV41eWSMh6VU'
  it('should properly generate some address from nonhardened key - child index starts with 0 in binary', () => {
    const derivedAddress3 = address.deriveAddressAndSecret(secret2, childIndex3).address
    assert.equal(derivedAddress3, expectedAddress3)
  })
})

describe('test address ownership verification', () => {
  const ownAddress =
    'DdzFFzCqrhsoStdHaBGfa5ZaLysiTnVuu7SHRcJvvu4yKg94gVBx3TzEV9CjphrFxLhnu1DJUKm2kdcrxYDZBGosrv4Gq3HuiFWRYVdZ'
  it('should accept own address', () => {
    assert.equal(address.isAddressDerivableFromSecretString(ownAddress, secret2), true)
  })

  const foreignAddress =
    'DdzFFzCqrht1Su7MEaCbFUcKpZnqQp5aUudPjrJZ2h8YADJBDvpsXZk9BducpXcSgujYJGKaTuZye9hb9z3Hff42TXDft5yrsKka6rDW'
  it('should reject foreign address', () => {
    assert.equal(address.isAddressDerivableFromSecretString(foreignAddress, secret2), false)
  })
})

describe('test wallet addresses derivation', () => {
  const expectedWalletAddresses = [
    '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',
  ]

  const walletAddresses = wallet.deriveAddresses()

  it('should derive the right sequence of addresses from the root secret key', () => {
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('test transaction fee function', () => {
  it('should properly compute transaction fee based on transaction size parameter', () => {
    assert.equal(txFeeFunction(50), 157579)
    assert.equal(txFeeFunction(351), 170807)
  })
})

describe('test successful transaction fee computation', async () => {
  mockBlockChainExplorer()
  it('should compute the right transaction fee for given transaction', async () => {
    assert.equal(await wallet.getTxFee(myAddress, 47), 178893)
  })

  it('should return fee -1 for an unallowed transaction (not enough resources on the account)', async () => {
    assert.equal(await wallet.getTxFee(myAddress, 1450000), -1)
  })
})

// eslint-disable-next-line prefer-arrow-callback
describe('test transaction serialization', function() {
  mockBlockChainExplorer()
  mockRandomNumberGenerator(0.7)
  this.timeout(5000)

  it('should properly serialize transaction inner body', async () => {
    const tx = await wallet.prepareTx(myAddress, 47)

    // transaction serialization before providing witnesses
    const utxSerialized = cbor.encode(tx.getTxAux()).toString('hex')
    const expectedUtxSerialized =
      '839f8200d818582482582014fab8b89cc003da76c147af4ce3619bc36f7064b69f48b7fbad63673753f351018200d81858248258201ce7a1e2606271a7f085262fb7c509c98d60912a943c9be3871ac3ace48ae6d601ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581c0878fbeaf6d490d49664c99c9284108e0a58387f31224b8b34428fc9a101581e581c2eab4601bfe5834281489b4f0a202c5a8cf558ba330004952411670a001a9c8c59d91a00142864ffa0'

    assert.equal(utxSerialized, expectedUtxSerialized)
  })

  // transaction hash computation
  it('should properly compute transaction hash', async () => {
    const tx = await wallet.prepareTx(myAddress, 47)

    const txHash = tx.getId()
    const expectedTxHash = 'd9cbe3036b13fb877d0c30ec2d80317ec0833e52216b216b04258b5c35afea96'

    assert.equal(txHash, expectedTxHash, 'transaction hash is wrong')
  })

  // transaction witnesses computation
  it('should properly compute transaction witnesses', async () => {
    const tx = await wallet.prepareTx(myAddress, 47)
    const witnesses = tx.getWitnesses()
    const witnessesSerialized = cbor.encode(witnesses).toString('hex')
    const expectedWitnessesSerialized =
      '828200d8185885825840fa5955500ecacca4939204a8f1af4639747a161cd35a35368c9c8d48df32685b0f48b0997c0e22e87e9533ba19310ba4a9bf0c6cf37bfed513c37de15761d56e584009209ef220b4588cd7b73c436366194ef5cf78091f7fbec4e3f5953a325e34740e0850f6c5efd7ed7a90e5579a431b083b7e79c244ba9b4340d3c73797f89f008200d8185885825840545448ff0dba05dcc4587f522c11b358afe8b974a588364ba074b9017f241b71eac253db1f265e409beeca1858664002572715de9533094eb757525b4f372af558405fdc18f4b49ce8bdb503ea213dea9b8ac1b880cacf08c283b7c8cacef7d1f04154532a5e12f6807608595db9398594855c792e94e34a008bb767ff6f5172060f'

    assert.equal(
      witnessesSerialized,
      expectedWitnessesSerialized,
      'transaction witnesses are wrong'
    )
  })

  // whole transaction serialization
  it('should properly serialize the whole transaction', async () => {
    const tx = await wallet.prepareTx(myAddress, 47)

    const txBody = cbor.encode(tx).toString('hex')
    const expectedTxBody =
      '82839f8200d818582482582014fab8b89cc003da76c147af4ce3619bc36f7064b69f48b7fbad63673753f351018200d81858248258201ce7a1e2606271a7f085262fb7c509c98d60912a943c9be3871ac3ace48ae6d601ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581c0878fbeaf6d490d49664c99c9284108e0a58387f31224b8b34428fc9a101581e581c2eab4601bfe5834281489b4f0a202c5a8cf558ba330004952411670a001a9c8c59d91a00142864ffa0828200d8185885825840fa5955500ecacca4939204a8f1af4639747a161cd35a35368c9c8d48df32685b0f48b0997c0e22e87e9533ba19310ba4a9bf0c6cf37bfed513c37de15761d56e584009209ef220b4588cd7b73c436366194ef5cf78091f7fbec4e3f5953a325e34740e0850f6c5efd7ed7a90e5579a431b083b7e79c244ba9b4340d3c73797f89f008200d8185885825840545448ff0dba05dcc4587f522c11b358afe8b974a588364ba074b9017f241b71eac253db1f265e409beeca1858664002572715de9533094eb757525b4f372af558405fdc18f4b49ce8bdb503ea213dea9b8ac1b880cacf08c283b7c8cacef7d1f04154532a5e12f6807608595db9398594855c792e94e34a008bb767ff6f5172060f'

    assert.equal(txBody, expectedTxBody, 'transaction serialization is wrong')
  })
})

describe('test wallet balance computation', async () => {
  mockBlockChainExplorer()

  it('should properly fetch wallet balance', async () => {
    assert.equal(await wallet.getBalance(), 1500000)
  })
})

describe('test wallet history parsing', async () => {
  mockBlockChainExplorer()

  it('should properly fetch wallet history', async () => {
    assert.equal(JSON.stringify(await wallet.getHistory()), JSON.stringify(history))
  })
})

// eslint-disable-next-line prefer-arrow-callback
describe('test transaction submission', function() {
  mockTransactionSubmitter()
  this.timeout(5000)

  it('should properly submit transaction', async () => {
    const result = await wallet.sendAda(myAddress, 47)
    assert.equal(result, true)
  })
})
