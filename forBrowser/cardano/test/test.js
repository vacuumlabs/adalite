// using nodejs's build in asserts that throw on failure
const assert = require('assert')
const fetchMock = require('fetch-mock')
const cbor = require('cbor')
const sinon = require('sinon')

const utils = require('../utils')
const transaction = require('../transaction')
const mnemonic = require('../mnemonic')
const address = require('../address')
const CardanoWallet = require('../cardano-wallet').CardanoWallet
const config = require('../config')

function mockBlockChainExplorer() {
  fetchMock.config.overwriteRoutes = true

  const addressesAndResponses = {
    'DdzFFzCqrhsivVgm2FLicfDdsSpfJEcEE9g88zvcpCj7V6AWZgopLjtR7c9nhGNC2gLB4UYoJMjMhmnXtQciQAy1PJCY7Y33tvNybzf1': {
      Right: {
        caAddress:
          'DdzFFzCqrhsivVgm2FLicfDdsSpfJEcEE9g88zvcpCj7V6AWZgopLjtR7c9nhGNC2gLB4UYoJMjMhmnXtQciQAy1PJCY7Y33tvNybzf1',
        caType: 'CPubKeyAddress',
        caTxNum: 2,
        caBalance: {getCoin: '129015'},
        caTxList: [
          {
            ctbId: '832a3801a9e46cc938a988d4c97ce82e53b20aea765624a89e3c7d35ef7e3650',
            ctbTimeIssued: 1519994871,
            ctbInputs: [
              [
                'DdzFFzCqrhsivVgm2FLicfDdsSpfJEcEE9g88zvcpCj7V6AWZgopLjtR7c9nhGNC2gLB4UYoJMjMhmnXtQciQAy1PJCY7Y33tvNybzf1',
                {getCoin: '300000'},
              ],
            ],
            ctbOutputs: [
              [
                'DdzFFzCqrhswmyfTS3u8VtJyQNopv4MkGt3trhwKG9s4kfvJwinCnCXBYR5nw6tTYSchxY7rdM2SUxZDu69t7WLVWx4orbqDQfgNguR6',
                {getCoin: '47'},
              ],
              [
                'DdzFFzCqrhsivVgm2FLicfDdsSpfJEcEE9g88zvcpCj7V6AWZgopLjtR7c9nhGNC2gLB4UYoJMjMhmnXtQciQAy1PJCY7Y33tvNybzf1',
                {getCoin: '129015'},
              ],
            ],
            ctbInputSum: {getCoin: '300000'},
            ctbOutputSum: {getCoin: '129062'},
          },
          {
            ctbId: '5811c19f26a224b7078164bc1b58b40b9f3f2d4db8fc75ae6c3da0efc62f2ab9',
            ctbTimeIssued: 1519994651,
            ctbInputs: [
              [
                'DdzFFzCqrht7sGUFDwVzstZWxxEjF4LA9fXqKp8ukpQE79qkKfUeWaJMaNpYpdsQiP1sfHv4oTzPNZQs86wzS5revG6vxqa7SikRXQCV',
                {getCoin: '909363'},
              ],
            ],
            ctbOutputs: [
              [
                'DdzFFzCqrhsfcrGg11KhEmyDmdk3hLRQKH6QRj9ZpafraFzLH2iXivzdAGPbC6E5YcgjgysAoev7q4e9Ugq3ognhz6FgKQCQkSbkPxT6',
                {getCoin: '438469'},
              ],
              [
                'DdzFFzCqrhsivVgm2FLicfDdsSpfJEcEE9g88zvcpCj7V6AWZgopLjtR7c9nhGNC2gLB4UYoJMjMhmnXtQciQAy1PJCY7Y33tvNybzf1',
                {getCoin: '300000'},
              ],
            ],
            ctbInputSum: {getCoin: '909363'},
            ctbOutputSum: {getCoin: '738469'},
          },
        ],
      },
    },
    'DdzFFzCqrhswKekq5Ysev3wL15MndorSfEF82TV5dxHihGjjVweXvmkza4zGnQj3jkvrobwFTnoBpxqes447eVbUDopk3NpLAcQnmfdF': {
      Right: {
        caAddress:
          'DdzFFzCqrhswKekq5Ysev3wL15MndorSfEF82TV5dxHihGjjVweXvmkza4zGnQj3jkvrobwFTnoBpxqes447eVbUDopk3NpLAcQnmfdF',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsmccT3YihDKQ5KCD38J2UFJk6RUASm9SRtTUdUjk8ckefYex6vBGEThiga4Rxwguo41jR9Z3V1S8BBDYxaU4qaWNrsFhb6': {
      Right: {
        caAddress:
          'DdzFFzCqrhsmccT3YihDKQ5KCD38J2UFJk6RUASm9SRtTUdUjk8ckefYex6vBGEThiga4Rxwguo41jR9Z3V1S8BBDYxaU4qaWNrsFhb6',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsjXT3cnX4bQz962iPoYN8Dg86fUcbE9LcZgGqh6M2q3cVn8T8YFk6YnJy6ktEZwTrpBu2UFppjP278vhaZtqxP1zJLD45g': {
      Right: {
        caAddress:
          'DdzFFzCqrhsjXT3cnX4bQz962iPoYN8Dg86fUcbE9LcZgGqh6M2q3cVn8T8YFk6YnJy6ktEZwTrpBu2UFppjP278vhaZtqxP1zJLD45g',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsjiaipx1j73iVt71CXzyBdXKwcxjvr1yjvrDiT2nFe4habRYDGCju8K15h4r94XgGUCippXSDWpvw4Ced8u9nQquXggPJN': {
      Right: {
        caAddress:
          'DdzFFzCqrhsjiaipx1j73iVt71CXzyBdXKwcxjvr1yjvrDiT2nFe4habRYDGCju8K15h4r94XgGUCippXSDWpvw4Ced8u9nQquXggPJN',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhstbzRrLTb1JyBnCMRYiVd6oHSW1HVNGxQWM1NaJpQdqe1GWJcTmmwgXgxYzUVSwQiuVquNHuiYeaBDrGxBZz8ZWdXJ3TeV': {
      Right: {
        caAddress:
          'DdzFFzCqrhstbzRrLTb1JyBnCMRYiVd6oHSW1HVNGxQWM1NaJpQdqe1GWJcTmmwgXgxYzUVSwQiuVquNHuiYeaBDrGxBZz8ZWdXJ3TeV',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhseRqK4diUWHnfDTUwa2QJL3aG1Jiq6RyDnVsCScEbjYKRtxeGtaF5FnvEQA1yub5w9xvu9ATJwbV3Jr2Hx2asPzWd25DFZ': {
      Right: {
        caAddress:
          'DdzFFzCqrhseRqK4diUWHnfDTUwa2QJL3aG1Jiq6RyDnVsCScEbjYKRtxeGtaF5FnvEQA1yub5w9xvu9ATJwbV3Jr2Hx2asPzWd25DFZ',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsyVbmK9eZqrrT4x8PhfDWtiuH8C22u7vqUCW37c2piwvVwsat8vZAF3enDx4qX5f8BTVLioKJVfZL6eHXxod3RL8QmQUaA': {
      Right: {
        caAddress:
          'DdzFFzCqrhsyVbmK9eZqrrT4x8PhfDWtiuH8C22u7vqUCW37c2piwvVwsat8vZAF3enDx4qX5f8BTVLioKJVfZL6eHXxod3RL8QmQUaA',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsrSTaAUjjU5kXshDzWEpiTUARJEmWbYjPHvX29jQKgtAqh68xsFAVFfmztuattaKfbVxQAatA1FYU5aD92TaQ91JKncNvG': {
      Right: {
        caAddress:
          'DdzFFzCqrhsrSTaAUjjU5kXshDzWEpiTUARJEmWbYjPHvX29jQKgtAqh68xsFAVFfmztuattaKfbVxQAatA1FYU5aD92TaQ91JKncNvG',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsgErn96PqpDUMPupiHhyMUMpgppcN4Xd4Lf8FBZLmwChfzHaEYC5obPhTA3vt3fEWUsyrpXdxsCBYWcbBxsG6orjSvbJst': {
      Right: {
        caAddress:
          'DdzFFzCqrhsgErn96PqpDUMPupiHhyMUMpgppcN4Xd4Lf8FBZLmwChfzHaEYC5obPhTA3vt3fEWUsyrpXdxsCBYWcbBxsG6orjSvbJst',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhst6rR3xHiQ33vfWAcVMZGvDbygSUK7i3WgmUy3v5YbTYAGaHzsayjxY5fp3ykDxeLdfciJfpo7hqHUzzGaeFBKSNdrYjKj': {
      Right: {
        caAddress:
          'DdzFFzCqrhst6rR3xHiQ33vfWAcVMZGvDbygSUK7i3WgmUy3v5YbTYAGaHzsayjxY5fp3ykDxeLdfciJfpo7hqHUzzGaeFBKSNdrYjKj',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrht5fgT1Hr855QzvMsxagivGV5kiaf2hV3857VTMoD2bfoakcCMz4xWFLJ4qHXRtxc6GPQPMdQ8GPir74SrW7GLnwRSm5oBB': {
      Right: {
        caAddress:
          'DdzFFzCqrht5fgT1Hr855QzvMsxagivGV5kiaf2hV3857VTMoD2bfoakcCMz4xWFLJ4qHXRtxc6GPQPMdQ8GPir74SrW7GLnwRSm5oBB',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrht1vxD2QC4R7JdEja8GexgxknMQu7NNwKtwz2iS87rCKGkHocrC8aq9Xa1sSJkWAjtgrHZn5NQe6FUdKos1K5gLWRU4VYdz': {
      Right: {
        caAddress:
          'DdzFFzCqrht1vxD2QC4R7JdEja8GexgxknMQu7NNwKtwz2iS87rCKGkHocrC8aq9Xa1sSJkWAjtgrHZn5NQe6FUdKos1K5gLWRU4VYdz',
        caType: 'CPubKeyAddress',
        caTxNum: 1,
        caBalance: {getCoin: '100000'},
        caTxList: [
          {
            ctbId: 'd733abd1d3db639ce0ae29df3a0958c0eb19ace60434336d1705509492b4c761',
            ctbTimeIssued: 1519999111,
            ctbInputs: [
              [
                'DdzFFzCqrhsfcrGg11KhEmyDmdk3hLRQKH6QRj9ZpafraFzLH2iXivzdAGPbC6E5YcgjgysAoev7q4e9Ugq3ognhz6FgKQCQkSbkPxT6',
                {getCoin: '438469'},
              ],
            ],
            ctbOutputs: [
              [
                'DdzFFzCqrhtCyU8KiQmhL711iAJ9ccTw1CxAtNwHij5GdshGCFmMzDEqnGuf6TGh5uQDhy1qAHRXqCexkTvU8cxy3aXk3qFyeK6oZ8be',
                {getCoin: '167575'},
              ],
              [
                'DdzFFzCqrht1vxD2QC4R7JdEja8GexgxknMQu7NNwKtwz2iS87rCKGkHocrC8aq9Xa1sSJkWAjtgrHZn5NQe6FUdKos1K5gLWRU4VYdz',
                {getCoin: '100000'},
              ],
            ],
            ctbInputSum: {getCoin: '438469'},
            ctbOutputSum: {getCoin: '267575'},
          },
        ],
      },
    },
    'DdzFFzCqrhshrgCvjfpvptY5FhXKniVvikpuPNRnu7hbEmbawfjgib1ZoT39hERjCbmA8nZ4AG6Zf6A4DXnvL67dGSXVwQZ8kvFpQTbv': {
      Right: {
        caAddress:
          'DdzFFzCqrhshrgCvjfpvptY5FhXKniVvikpuPNRnu7hbEmbawfjgib1ZoT39hERjCbmA8nZ4AG6Zf6A4DXnvL67dGSXVwQZ8kvFpQTbv',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsqzqdwV3YG9Y3zTGQaoY28u777yn95WpF7yCvcdYGyx5MF5qBUWhnboWn9Ma17kVGdmUo2YEbxr7YVZ6bhenRL2snJVoWf': {
      Right: {
        caAddress:
          'DdzFFzCqrhsqzqdwV3YG9Y3zTGQaoY28u777yn95WpF7yCvcdYGyx5MF5qBUWhnboWn9Ma17kVGdmUo2YEbxr7YVZ6bhenRL2snJVoWf',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    'DdzFFzCqrhsrASdDq8FwYFZSQWjrRW85HFMNS9d5dNk5DdXs5UYei14m7h1YgNEBEBQsKSLQERL1pa7GaT5Hjo2YGeuxSo4xS8mja8WC': {
      Right: {
        caAddress:
          'DdzFFzCqrhsrASdDq8FwYFZSQWjrRW85HFMNS9d5dNk5DdXs5UYei14m7h1YgNEBEBQsKSLQERL1pa7GaT5Hjo2YGeuxSo4xS8mja8WC',
        caType: 'CPubKeyAddress',
        caTxNum: 0,
        caBalance: {getCoin: '0'},
        caTxList: [],
      },
    },
    '*': {},
  }
  // eslint-disable-next-line guard-for-in
  for (const address in addressesAndResponses) {
    fetchMock.mock({
      matcher: `${config.blockchain_explorer_url}/api/addresses/summary/${address}`,
      response: {
        status: 200,
        body: addressesAndResponses[address],
        sendAsJson: true,
      },
    })
  }
}

function mockTransactionSubmitter() {
  fetchMock.config.overwriteRoutes = true

  const requestsAndResponses = {
    '{"txHash":"60cc8a3a766f99b630dbf7b4396f04e1ca8db0f562d54e1fade91235c798d4c6","txBody":"82839f8200d8185824825820832a3801a9e46cc938a988d4c97ce82e53b20aea765624a89e3c7d35ef7e3650018200d8185824825820d733abd1d3db639ce0ae29df3a0958c0eb19ace60434336d1705509492b4c76101ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cc5df000ed6ec84d14db177b71f5b63520a3847d1361e383543d2d3afa101581e581c2eab4601bfe583c2840b2b4fee027ac05963bc8f8f5ef30ddc77b4a1001a8eb0e6c619c39bffa0828200d818588582584051e7ce6dd9f07afa880a2d55d65396ebc4588850038775b70c9cbb19e003b1cb1db0b4a17591363ca72123e98746268a0c9c09c1293d70d00885ca37861a650358404ab6db12094ce22ddca8995fa4b9b95636124e0ec658c57b728b1d23d87af81e7ceb878760d8067258f03fcd4d2181a5c706ac923f26db1c261765f23847ec098200d8185885825840021172f166d00a69bbedd52b093a161d2c1de3483d6c0c9ee8ed53d1a15c9b5dabc9def063f90350503c20856073d4690ff00257943c701867771e59e377c4ab5840380063e4f2f060ece8fe2204cd8e28c2cfaf9a7640153191cb2a8f34b8b5a7ed8ab9423c5d454fd2157634518c32004a117ee14ed66604dbfb0ed9be9398e503"}': {
      result: true,
    },
  }
  // eslint-disable-next-line guard-for-in
  for (const request in requestsAndResponses) {
    fetchMock.mock({
      matcher: (url, opts) => {
        return url === config.transaction_submitter_url && opts && opts.body === request
      },
      response: {
        status: 200,
        body: requestsAndResponses[request],
        sendAsJson: true,
      },
    })
  }

  fetchMock.mock({
    matcher: config.transaction_submitter_url,
    response: {
      status: 200,
      body: {result: false},
      sendAsJson: true,
    },
  })
}

function mockRandomNumberGenerator(value) {
  sinon.stub(Math, 'random').returns(value)
}

describe('test signing', () => {
  const secret = new transaction.WalletSecretString(
    '50f26a6d0e454337554274d703033c21a06fecfcb0457b15214e41ea3228ac51e2b9f0ca0f6510cfdd24325ac6676cdd98a9484336ba36c876fd93aa439d8b72eddaef2fab3d1412ea1f2517b5a50439c28c27d6aefafce38f9290c17e1e7d56c532f2e7a6620550b32841a24055e89c02256dec21d1f4418004ffc9591a8e9c'
  )
  const message = '011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950'
  const signature =
    'ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dea8eb8bae46a1824f62fb80cc3b65aff02'

  it('should produce proper signature', () => {
    // test signing
    assert.equal(utils.sign(message, secret), signature)
  })
})

describe('test signature verification', () => {
  const secret = new transaction.WalletSecretString(
    '50f26a6d0e454337554274d703033c21a06fecfcb0457b15214e41ea3228ac51e2b9f0ca0f6510cfdd24325ac6676cdd98a9484336ba36c876fd93aa439d8b72eddaef2fab3d1412ea1f2517b5a50439c28c27d6aefafce38f9290c17e1e7d56c532f2e7a6620550b32841a24055e89c02256dec21d1f4418004ffc9591a8e9c'
  )
  const message = '011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950'
  const rightSignature =
    'ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dea8eb8bae46a1824f62fb80cc3b65aff02'
  const wrongSignature =
    'ca20e54f4cb12f0453de2d62b0ff041b0c90ef43e7f899c6cbc428dcd5bece2f68a9c8917e7e3881bf709b7845909dff8eb8bae46a1824f62fb80cc3b65aff02'

  it('should accept signature', () => {
    assert.equal(utils.verify(message, secret.getPublicKey(), rightSignature), true)
  })

  it('should reject signature', () => {
    assert.equal(utils.verify(message, secret.getPublicKey(), wrongSignature), false)
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
  const secret = new transaction.WalletSecretString(
    'a859bcad5de4fd8df3f3bfa24793dba52785f9a98832300844f028ff2dd75a5fcd24f7e51d3a2a72ac85cc163759b1103efb1d685308dcc6cd2cce09f70c948501e949b5b7a72f1ad304f47d842733b3481f2f096ca7ddfe8e1b7c20a1acafbb66ee772671d4fef6418f670e80ad44d1747a89d75a4ad386452ab5dc1acc32b3'
  )

  // root public secret key (the one used as 'wallet id' in Daedalus)
  const childIndex1 = 0x80000000
  const expectedSecret1 =
    '28e375ee5af42a9641c5c31b1b2d24df7f1d2212116bc0b0fc58816f06985b072cf5960d205736cac2e8224dd6018f7223c1bdc630d2b866703670a37316f44003b5417131136bd53174f09b129ae0499bd718ca55c5d40877c33b5ee10e5ba89661f96070a9d39df75c21f6142415502e254523cbacff2b4d58aa87d9021d65'
  it("should properly derive root public secret key (the one used as 'wallet id' in Daedalus)", () => {
    const derivedSecret1 = address.deriveSK(secret, childIndex1).secretString
    assert.equal(derivedSecret1, expectedSecret1)
  })

  // some hardened secret key - child index starts with 1 in binary
  const childIndex2 = 0xf9745151
  const expectedSecret2 =
    'ffd89a6ecc943cd58766294e7575d20f775eba62a93361412d61718026781c00d3d86147df3aa92147ea48f786b2cd2bd7d756d37add3055caa8ba4f1d543198b79060c204436cfb0a660a25a43d3b80bd10a167dacb70e0a9d1ca424c8259e7f0bd12bacfb4f58697cd088f6531130584933aed7dfe53163b7f24f10e6c25da'
  it('should properly derive some hardened secret key - child index starts with 1 in binary', () => {
    const derivedSecret2 = address.deriveSK(secret, childIndex2).secretString
    assert.equal(derivedSecret2, expectedSecret2)
  })

  const childIndex3 = 0x10000323
  const expectedSecret3 =
    'e0f31d972365bb76a2dd837c7ba5b4b7c065fa4ad1fbf808ddc17130bf10c40f63772cbaa1cdf7e847543f3cbcb3da7065498c71c04ca1f5cd9dccc18226461efdade44a3c35cfb6ab9c834dbc418da2cba30501139db384f194ef060847d0bd164f072124bcf55af0f01c1b5cd7759a7262b4d205717f4afb282cf98fed3026'
  it('should properly derive some nonhardened secret key - child index starts with 0 in binary', () => {
    const derivedSecret3 = address.deriveSK(secret, childIndex3).secretString
    assert.equal(derivedSecret3, expectedSecret3)
  })
})

describe('test address generation from secret key', () => {
  const secret = new transaction.WalletSecretString(
    'a859bcad5de4fd8df3f3bfa24793dba52785f9a98832300844f028ff2dd75a5fcd24f7e51d3a2a72ac85cc163759b1103efb1d685308dcc6cd2cce09f70c948501e949b5b7a72f1ad304f47d842733b3481f2f096ca7ddfe8e1b7c20a1acafbb66ee772671d4fef6418f670e80ad44d1747a89d75a4ad386452ab5dc1acc32b3'
  )

  const childIndex1 = 0x80000000
  const expectedAddress1 = 'Ae2tdPwUPEZLdysXE34s6xRCpqSHvy5mRbrQiegSVQGQFBvkXf5pvseKuzH'
  it("should properly generate root public address (the one used as 'wallet id' in Daedalus)", () => {
    const derivedAddress1 = address.deriveAddressAndSecret(secret, childIndex1).address
    assert.equal(derivedAddress1, expectedAddress1)
  })

  const childIndex2 = 0xf9745151
  const expectedAddress2 =
    'DdzFFzCqrht5AaL5KGUxfD7sSNiGNmz6DaUmmRAmXApD6yjNy6xLNq1KsXcMAaQipKENnxYLy317KZzSBorB2dEMuQcS5z8AU9akLaMm'
  it('should properly generate some address from hardened key - child index starts with 1 in binary', () => {
    const derivedAddress2 = address.deriveAddressAndSecret(secret, childIndex2).address
    assert.equal(derivedAddress2, expectedAddress2)
  })

  const childIndex3 = 0x10000323
  const expectedAddress3 =
    'DdzFFzCqrhsf6sUbywd6FfZHfvmkT7drL7MLzs5KkvfSpTNLExLHhhwmuKdAajnHE3cebNPPkfyUYpoqgEV7ktDLUHF5dV41eWSMh6VU'
  it('should properly generate some address from nonhardened key - child index starts with 0 in binary', () => {
    const derivedAddress3 = address.deriveAddressAndSecret(secret, childIndex3).address
    assert.equal(derivedAddress3, expectedAddress3)
  })
})

describe('test address ownership verification', () => {
  const secret = new transaction.WalletSecretString(
    'a859bcad5de4fd8df3f3bfa24793dba52785f9a98832300844f028ff2dd75a5fcd24f7e51d3a2a72ac85cc163759b1103efb1d685308dcc6cd2cce09f70c948501e949b5b7a72f1ad304f47d842733b3481f2f096ca7ddfe8e1b7c20a1acafbb66ee772671d4fef6418f670e80ad44d1747a89d75a4ad386452ab5dc1acc32b3'
  )

  const ownAddress =
    'DdzFFzCqrhsoStdHaBGfa5ZaLysiTnVuu7SHRcJvvu4yKg94gVBx3TzEV9CjphrFxLhnu1DJUKm2kdcrxYDZBGosrv4Gq3HuiFWRYVdZ'
  it('should accept own address', () => {
    assert.equal(address.isAddressDerivableFromSecretString(ownAddress, secret), true)
  })

  const foreignAddress =
    'DdzFFzCqrht1Su7MEaCbFUcKpZnqQp5aUudPjrJZ2h8YADJBDvpsXZk9BducpXcSgujYJGKaTuZye9hb9z3Hff42TXDft5yrsKka6rDW'
  it('should reject foreign address', () => {
    assert.equal(address.isAddressDerivableFromSecretString(foreignAddress, secret), false)
  })
})

describe('test wallet addresses derivation', () => {
  const expectedWalletAddresses = [
    'DdzFFzCqrhsivVgm2FLicfDdsSpfJEcEE9g88zvcpCj7V6AWZgopLjtR7c9nhGNC2gLB4UYoJMjMhmnXtQciQAy1PJCY7Y33tvNybzf1',
    'DdzFFzCqrhswKekq5Ysev3wL15MndorSfEF82TV5dxHihGjjVweXvmkza4zGnQj3jkvrobwFTnoBpxqes447eVbUDopk3NpLAcQnmfdF',
    'DdzFFzCqrhsmccT3YihDKQ5KCD38J2UFJk6RUASm9SRtTUdUjk8ckefYex6vBGEThiga4Rxwguo41jR9Z3V1S8BBDYxaU4qaWNrsFhb6',
    'DdzFFzCqrhsjXT3cnX4bQz962iPoYN8Dg86fUcbE9LcZgGqh6M2q3cVn8T8YFk6YnJy6ktEZwTrpBu2UFppjP278vhaZtqxP1zJLD45g',
    'DdzFFzCqrhsjiaipx1j73iVt71CXzyBdXKwcxjvr1yjvrDiT2nFe4habRYDGCju8K15h4r94XgGUCippXSDWpvw4Ced8u9nQquXggPJN',
    'DdzFFzCqrhstbzRrLTb1JyBnCMRYiVd6oHSW1HVNGxQWM1NaJpQdqe1GWJcTmmwgXgxYzUVSwQiuVquNHuiYeaBDrGxBZz8ZWdXJ3TeV',
    'DdzFFzCqrhseRqK4diUWHnfDTUwa2QJL3aG1Jiq6RyDnVsCScEbjYKRtxeGtaF5FnvEQA1yub5w9xvu9ATJwbV3Jr2Hx2asPzWd25DFZ',
    'DdzFFzCqrhsyVbmK9eZqrrT4x8PhfDWtiuH8C22u7vqUCW37c2piwvVwsat8vZAF3enDx4qX5f8BTVLioKJVfZL6eHXxod3RL8QmQUaA',
    'DdzFFzCqrhsrSTaAUjjU5kXshDzWEpiTUARJEmWbYjPHvX29jQKgtAqh68xsFAVFfmztuattaKfbVxQAatA1FYU5aD92TaQ91JKncNvG',
    'DdzFFzCqrhsgErn96PqpDUMPupiHhyMUMpgppcN4Xd4Lf8FBZLmwChfzHaEYC5obPhTA3vt3fEWUsyrpXdxsCBYWcbBxsG6orjSvbJst',
    'DdzFFzCqrhst6rR3xHiQ33vfWAcVMZGvDbygSUK7i3WgmUy3v5YbTYAGaHzsayjxY5fp3ykDxeLdfciJfpo7hqHUzzGaeFBKSNdrYjKj',
    'DdzFFzCqrht5fgT1Hr855QzvMsxagivGV5kiaf2hV3857VTMoD2bfoakcCMz4xWFLJ4qHXRtxc6GPQPMdQ8GPir74SrW7GLnwRSm5oBB',
    'DdzFFzCqrht1vxD2QC4R7JdEja8GexgxknMQu7NNwKtwz2iS87rCKGkHocrC8aq9Xa1sSJkWAjtgrHZn5NQe6FUdKos1K5gLWRU4VYdz',
    'DdzFFzCqrhshrgCvjfpvptY5FhXKniVvikpuPNRnu7hbEmbawfjgib1ZoT39hERjCbmA8nZ4AG6Zf6A4DXnvL67dGSXVwQZ8kvFpQTbv',
    'DdzFFzCqrhsqzqdwV3YG9Y3zTGQaoY28u777yn95WpF7yCvcdYGyx5MF5qBUWhnboWn9Ma17kVGdmUo2YEbxr7YVZ6bhenRL2snJVoWf',
    'DdzFFzCqrhsrASdDq8FwYFZSQWjrRW85HFMNS9d5dNk5DdXs5UYei14m7h1YgNEBEBQsKSLQERL1pa7GaT5Hjo2YGeuxSo4xS8mja8WC',
  ]

  const wallet = new CardanoWallet(
    'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3'
  )
  const walletAddresses = wallet.getUsedAddresses()

  it('should derive the right sequence of addresses from the root secret key', () => {
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('test transaction fee function', () => {
  it('should properly compute transaction fee based on transaction size parameter', () => {
    assert.equal(CardanoWallet.txFeeFunction(50), 157579)
    assert.equal(CardanoWallet.txFeeFunction(351), 170807)
  })
})

describe('test successful transaction fee computation', () => {
  mockBlockChainExplorer()
  const wallet = new CardanoWallet(
    'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3'
  )
  it('should compute the right transaction fee for given transaction', async () => {
    assert.equal(
      await wallet.getTxFee(
        'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
        47
      ),
      178893
    )
  })

  it('should return fee -1 for an unallowed transaction (not enough resources on the account)', async () => {
    assert.equal(
      await wallet.getTxFee(
        'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
        750000
      ),
      -1
    )
  })
})

describe('test transaction serialization', () => {
  mockBlockChainExplorer()
  mockRandomNumberGenerator(0.7)

  const wallet = new CardanoWallet(
    'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3'
  )

  it('should properly serialize transaction inner body', async () => {
    const tx = await wallet.prepareTx(
      'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
      47
    )

    // transaction serialization before providing witnesses
    const utxSerialized = cbor.encode(tx.getTxAux()).toString('hex')
    const expectedUtxSerialized =
      '839f8200d8185824825820832a3801a9e46cc938a988d4c97ce82e53b20aea765624a89e3c7d35ef7e3650018200d8185824825820d733abd1d3db639ce0ae29df3a0958c0eb19ace60434336d1705509492b4c76101ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cc5df000ed6ec84d14db177b71f5b63520a3847d1361e383543d2d3afa101581e581c2eab4601bfe583c2840b2b4fee027ac05963bc8f8f5ef30ddc77b4a1001a8eb0e6c619c39bffa0'

    assert.equal(utxSerialized, expectedUtxSerialized)
  })

  // transaction hash computation
  it('should properly compute transaction hash', async () => {
    const tx = await wallet.prepareTx(
      'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
      47
    )

    const txHash = tx.getId()
    const expectedTxHash = '60cc8a3a766f99b630dbf7b4396f04e1ca8db0f562d54e1fade91235c798d4c6'

    assert.equal(txHash, expectedTxHash, 'transaction hash is wrong')
  })

  // transaction witnesses computation
  it('should properly compute transaction witnesses', async () => {
    const tx = await wallet.prepareTx(
      'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
      47
    )
    const witnesses = tx.getWitnesses()
    const witnessesSerialized = cbor.encode(witnesses).toString('hex')
    const expectedWitnessesSerialized =
      '828200d818588582584051e7ce6dd9f07afa880a2d55d65396ebc4588850038775b70c9cbb19e003b1cb1db0b4a17591363ca72123e98746268a0c9c09c1293d70d00885ca37861a650358404ab6db12094ce22ddca8995fa4b9b95636124e0ec658c57b728b1d23d87af81e7ceb878760d8067258f03fcd4d2181a5c706ac923f26db1c261765f23847ec098200d8185885825840021172f166d00a69bbedd52b093a161d2c1de3483d6c0c9ee8ed53d1a15c9b5dabc9def063f90350503c20856073d4690ff00257943c701867771e59e377c4ab5840380063e4f2f060ece8fe2204cd8e28c2cfaf9a7640153191cb2a8f34b8b5a7ed8ab9423c5d454fd2157634518c32004a117ee14ed66604dbfb0ed9be9398e503'

    assert.equal(
      witnessesSerialized,
      expectedWitnessesSerialized,
      'transaction witnesses are wrong'
    )
  })

  // whole transaction serialization
  it('should properly serialize the whole transaction', async () => {
    const tx = await wallet.prepareTx(
      'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
      47
    )

    const txBody = cbor.encode(tx).toString('hex')
    const expectedTxBody =
      '82839f8200d8185824825820832a3801a9e46cc938a988d4c97ce82e53b20aea765624a89e3c7d35ef7e3650018200d8185824825820d733abd1d3db639ce0ae29df3a0958c0eb19ace60434336d1705509492b4c76101ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cc5df000ed6ec84d14db177b71f5b63520a3847d1361e383543d2d3afa101581e581c2eab4601bfe583c2840b2b4fee027ac05963bc8f8f5ef30ddc77b4a1001a8eb0e6c619c39bffa0828200d818588582584051e7ce6dd9f07afa880a2d55d65396ebc4588850038775b70c9cbb19e003b1cb1db0b4a17591363ca72123e98746268a0c9c09c1293d70d00885ca37861a650358404ab6db12094ce22ddca8995fa4b9b95636124e0ec658c57b728b1d23d87af81e7ceb878760d8067258f03fcd4d2181a5c706ac923f26db1c261765f23847ec098200d8185885825840021172f166d00a69bbedd52b093a161d2c1de3483d6c0c9ee8ed53d1a15c9b5dabc9def063f90350503c20856073d4690ff00257943c701867771e59e377c4ab5840380063e4f2f060ece8fe2204cd8e28c2cfaf9a7640153191cb2a8f34b8b5a7ed8ab9423c5d454fd2157634518c32004a117ee14ed66604dbfb0ed9be9398e503'

    assert.equal(txBody, expectedTxBody, 'transaction serialization is wrong')
  })
})

describe('test wallet balance computation', () => {
  mockBlockChainExplorer()
  const wallet = new CardanoWallet(
    'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3'
  )

  it('should properly fetch wallet balance', async () => {
    assert.equal(await wallet.getBalance(), 229015)
  })
})

describe('test transaction submission', () => {
  mockTransactionSubmitter()
  const wallet = new CardanoWallet(
    'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3'
  )

  it('should properly submit transaction', async () => {
    const result = await wallet.sendAda(
      'DdzFFzCqrhsgPcpYL9aevEtfvP4bTFHde8kjT3acCkbK9SvfC9iikDPRtfRP8Sq6fsusNfRfm7sjhJfo7LDPT3c4rDr8PqkdHfW8PfuY',
      47
    )
    assert.equal(result, true)
  })
})
