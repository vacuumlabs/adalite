/* eslint-disable max-len */
import assert from 'assert'

import ShelleyJsCryptoProvider from '../../frontend/wallet/shelley/shelley-js-crypto-provider'

import {ShelleyBaseAddressProvider} from '../../frontend/wallet/shelley/shelley-address-provider'
import {buildTransaction} from '../../frontend/wallet/shelley/helpers/chainlib-wrapper'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import loadWasmModule from './loadWasmModule'

const getCryptoProvider = async (mnemonic, networkId) => {
  const walletSecretDef = await mnemonicToWalletSecretDef(mnemonic)
  const network = {
    networkId,
  }
  return ShelleyJsCryptoProvider({walletSecretDef, network, config: {shouldExportPubKeyBulk: true}})
}

// inform mocha global leak detector
window.wasm = null
before(loadWasmModule)

describe('shelley address derivation', () => {
  const mnemonic15Words =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address'
  it('should derive base address from 15-words mnemonic', async () => {
    const cp = await getCryptoProvider(mnemonic15Words, 0) //TODO: change discriminator to networkId for shelley
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)
    const {address} = await addrGen(0)
    const expected =
      'addr1qzz6hulv54gzf2suy2u5gkvmt6ysasfdlvvegy3fmf969y7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qk0f2ud'

    assert.equal(address, expected)
  })

  const mnemonic12Words =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  // 12-word (legacy Daedalus) mnemonics should not be used in prod to derive base addresses at all
  // we just want to test that the V1 derivation scheme is applied for 12 word mnemonics
  it('should derive base address from 12-words mnemonic', async () => {
    const cp = await getCryptoProvider(mnemonic12Words, 0) //TODO: change discriminator to networkId for shelley
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)

    const {address} = await addrGen(0)
    const expected =
      'addr1qq3cu826yxrm8apxeata5pk5xrxxe9puqmru6ncltfv9c65a94kuhuc9jka90jnn78zd25lmm6vq8a79w9yjt8p4ykwst0wwa5'

    assert.equal(address, expected)
  })
})

describe('legacy utxo daedalus witness computation', () => {
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
