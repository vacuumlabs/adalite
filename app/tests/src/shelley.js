/* eslint-disable max-len */
import assert from 'assert'

import ShelleyJsCryptoProvider from '../../frontend/wallet/shelley/shelley-js-crypto-provider'

import {
  ShelleyBaseAddressProvider,
  ShelleyGroupAddressProvider,
} from '../../frontend/wallet/shelley/shelley-address-provider'
import {buildTransaction} from '../../frontend/wallet/shelley/helpers/chainlib-wrapper'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import _ from 'lodash'
import loadWasmModule from './loadWasmModule'

const getCryptoProvider = async (mnemonic, discriminator) => {
  const walletSecretDef = await mnemonicToWalletSecretDef(mnemonic)
  const network = {
    addressDiscriminator: discriminator,
  }
  return ShelleyJsCryptoProvider({walletSecretDef, network})
}

// inform mocha global leak detector
window.wasm = null
before(loadWasmModule)

// test vectors for mainnet
// abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address
// group/external/0 addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0

// test vectors for ITN
// miss torch plunge announce vacuum job gasp fix lottery ten merge style great section cactus
// account: 85a0a23a48bfb435aa2d5ec779ea4348684741f9695d51d034eda60608295b5d91
// addr1snwt9m3p2rvknj97fxm43452ndae5pe874nwzl48h6j8kcdn5p5apg9z8fytldp44gk4a3meafp5s6z8g8ukjh236q6wmfsxpq54khv3ujrlwz

describe('shelley address derivation', () => {
  const mnemonic1 =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address'

  it('should derive group addresses', async () => {
    const cp = await getCryptoProvider(mnemonic1, 'mainnet')
    const addrGen = ShelleyGroupAddressProvider(cp, 0, false)
    const addresses = await Promise.all(_.range(5).map((i) => addrGen(i).then((x) => x.address)))

    const expected = [
      'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      'addr1qjl2z0xka340zn0swmss0qqmlet3slw2zw962q73l0t7zdwtpd0ftg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgr3wuds',
      'addr1qj2re8xj8hlv4m7729hfwaxa8g04cj493vxk3dxaprugjed93d7m0g3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsg936smv',
      'addr1qn69l8ttc5a26sc69mqknqjuk476dc5hrxurqk8aruwnsa0tlnk0mg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsg4crst4',
      'addr1qser9zgaxt6p4wv3f7ngzrvcvyq0eqeayg97dxfskkkeyy5s79as8g3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgkap43f',
    ]
    assert.deepEqual(addresses, expected)
  })

  const mnemonic2 =
    'miss torch plunge announce vacuum job gasp fix lottery ten merge style great section cactus'
  it('should derive group addresses', async () => {
    const cp = await getCryptoProvider(mnemonic2, 'testnet')
    const addrGen = ShelleyGroupAddressProvider(cp, 0, false)

    const {address} = await addrGen(0)
    const expected =
      'addr1snwt9m3p2rvknj97fxm43452ndae5pe874nwzl48h6j8kcdn5p5apg9z8fytldp44gk4a3meafp5s6z8g8ukjh236q6wmfsxpq54khv3ujrlwz'

    assert.equal(address, expected)
  })

  const mnemonic3 = 'test walk nut penalty hip pave soap entry language right filter choice'
  it('should derive base address from cardano shelley test vectors', async () => {
    const cp = await getCryptoProvider(mnemonic3, 'testnet') //TODO: change discriminator to networkId for shelley
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)

    const {address} = await addrGen(0)
    const expected =
      'addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwqcyl47r'

    assert.equal(address, expected)
  })
})

describe.skip('legacy utxo daedalus witness computation', () => {
  it('should sign legacy daedalus witness correctly', async () => {
    const buildData = {
      inputs: [
        {
          type: 'utxo',
          txid: '272cc647d0905cbed3d48b69cfee06143b8c17e802d39636f554f811bbca470e',
          value: 2534819800,
          outputNo: 50,
          address:
            'DdzFFzCqrhsqedBRRVa8dZ9eFQfQErikMsgJC2YkkLY23gK4JzV9y6jKnRL8VSDEqczdzG3WYmj1vsXxCA2j1MvTS6GfMVA2dkiFrkK5',
          privkey:
            'bdce1aa2f36e7e11eb3dd796ecb5a8f705d066b3f7487d870b872b9409606e03465743b7b7ed0da7ba7fcfa3f467bbbe7a33e8b190d193c669c20b1c7c2fbecb',
          chaincode: '1ed58a10a86cf091cd58bc82e81823f0e09e6a050f8ac86999d7a9a9ef746396',
        },
      ],
      outputs: [
        {
          address:
            'addr1s3gk0ujtg44yydhm79wpyuacqmdqc7t7vehu4hf3k3deqhpjksdkgm4x5vucm43zyt80p6ehrcwan6exjzrlyldu5gx0sfdlcr4h7n9whvctsv',
          value: 5000000,
        },
        {
          address:
            'addr1s3j2g4qk8le8musj5ee6g5vwdhx5zpp0mkl480wdwfwnteg6fmqf2m4x5vucm43zyt80p6ehrcwan6exjzrlyldu5gx0sfdlcr4h7n9wsx6quc',
          value: 2529319800,
        },
      ],
      cert: null,
      chainConfig: {
        block0Hash: '8e4d2a343f3dcf9330ad9035b3e8d168e6728904262f2c434a4f8f934ec7b676',
        fees: {
          certificate: 10000,
          coefficient: 100000,
          constant: 200000,
          per_certificate_fees: {
            certificate_pool_registration: 500000000,
            certificate_stake_delegation: 400000,
          },
        },
      },
    }
    const tx = await buildTransaction(buildData)
    assert.equal(
      tx.transaction,
      '0140000201023200000000971647d8272cc647d0905cbed3d48b69cfee06143b8c17e802d39636f554f811bbca470e845167f24b456a4236fbf15c1273b806da0c797e666fcadd31b45b905c32b41b646ea6a3398dd62222cef0eb371e1dd9eb269087f27dbca20cf825bfc0eb7f4cae00000000004c4b408464a454163ff27df212a673a4518e6dcd41042fddbf53bdcd725d35e51a4ec0956ea6a3398dd62222cef0eb371e1dd9eb269087f27dbca20cf825bfc0eb7f4cae0000000096c25b7800d9ac5a0cddf4a904046af538777e3114309fb14599b464d4e0a63276a65dd2e01ed58a10a86cf091cd58bc82e81823f0e09e6a050f8ac86999d7a9a9ef746396e95cce4dc797a544998549fde8cf5ed4cd07a446622d71a9d579601992440ecc0e15faa3cf378a8ef75fa019310b4901f18e8e6d775b8a6ae53f19e97d36020e'
    )
    assert.equal(tx.fragmentId, 'a8f203ac9324c3b9e125986822fd0b5d3c03cbb57cac0e5ddbd79e22d4a82656')
  })
})
