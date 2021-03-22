/* eslint-disable max-len */
import assert from 'assert'

import ShelleyJsCryptoProvider from '../../frontend/wallet/shelley/shelley-js-crypto-provider'

import {ShelleyBaseAddressProvider} from '../../frontend/wallet/shelley/shelley-address-provider'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {NetworkId} from '../../frontend/wallet/types'

const getCryptoProvider = async (mnemonic, networkId) => {
  const walletSecretDef = await mnemonicToWalletSecretDef(mnemonic)
  const network = {
    networkId,
  }
  return await ShelleyJsCryptoProvider({
    walletSecretDef,
    network,
    config: {shouldExportPubKeyBulk: true},
  })
}

describe('shelley address derivation', () => {
  const mnemonic15Words =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address'
  it('should derive base address from 15-words mnemonic', async () => {
    const cp = await getCryptoProvider(mnemonic15Words, NetworkId.TESTNET) //TODO: change discriminator to networkId for shelley
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)
    const {address} = await addrGen(0)
    const expected =
      'addr_test1qzz6hulv54gzf2suy2u5gkvmt6ysasfdlvvegy3fmf969y7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qy0adz0'

    assert.equal(address, expected)
  })

  const mnemonic12Words =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  // 12-word (legacy Daedalus) mnemonics should not be used in prod to derive base addresses at all
  // we just want to test that the V1 derivation scheme is applied for 12 word mnemonics
  it('should derive base address from 12-words mnemonic', async () => {
    const cp = await getCryptoProvider(mnemonic12Words, NetworkId.TESTNET) //TODO: change discriminator to networkId for shelley
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)

    const {address} = await addrGen(0)
    const expected =
      'addr_test1qq3cu826yxrm8apxeata5pk5xrxxe9puqmru6ncltfv9c65a94kuhuc9jka90jnn78zd25lmm6vq8a79w9yjt8p4ykwse06frk'

    assert.equal(address, expected)
  })
})
