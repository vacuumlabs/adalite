/* eslint-disable max-len */
import * as assert from 'assert'

import ShelleyJsCryptoProvider from '../../frontend/wallet/shelley/shelley-js-crypto-provider'

import {ShelleyBaseAddressProvider} from '../../frontend/wallet/shelley/shelley-address-provider'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {NETWORKS} from '../../frontend/wallet/constants'
import {Network, NetworkId} from '../../frontend/wallet/types'

const getCryptoProvider = async (mnemonic, networkId) => {
  const walletSecretDef = await mnemonicToWalletSecretDef(mnemonic)
  const network = {
    networkId,
  } as Network

  return await ShelleyJsCryptoProvider({
    walletSecretDef,
    network,
    config: {shouldExportPubKeyBulk: true},
  })
}

const getExodusCryptoProvider = async (mnemonic: string) => {
  const walletSecretDef = await mnemonicToWalletSecretDef(mnemonic, {
    useExodusDerivationPath: true,
  })
  return await ShelleyJsCryptoProvider({
    walletSecretDef,
    network: NETWORKS.MAINNET,
    config: {shouldExportPubKeyBulk: true},
  })
}

describe('shelley address derivation', () => {
  const mnemonic15Words =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address'
  it('should derive base address from 15-words mnemonic', async () => {
    const cp = await getCryptoProvider(mnemonic15Words, NetworkId.TESTNETS)
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
    const cp = await getCryptoProvider(mnemonic12Words, NetworkId.TESTNETS)
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)

    const {address} = await addrGen(0)
    const expected =
      'addr_test1qq3cu826yxrm8apxeata5pk5xrxxe9puqmru6ncltfv9c65a94kuhuc9jka90jnn78zd25lmm6vq8a79w9yjt8p4ykwse06frk'

    assert.equal(address, expected)
  })
})

describe("Exodus mnemonic derivation (BIP39 + m/44'/1815'/0'/0/0)", () => {
  const exodusMnemonic =
    'sleep panda scene require front glare loud discover above wrap rail timber'

  it('should derive mainnet base address #0 matching Exodus wallet', async () => {
    const cp = await getExodusCryptoProvider(exodusMnemonic)
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)
    const {address} = await addrGen(0)
    const expected =
      'addr1qx7vkex7xwgxljmh2fj24gjt8pprm75uswyads6r2k3m8cauedjduvusdl9hw5ny423ykwzz8hafequf6mp5x4drk03s03t9un'
    assert.equal(address, expected)
  })

  it("should derive distinct receive addresses at m/44'/1815'/{n}'/0/0", async () => {
    const cp = await getExodusCryptoProvider(exodusMnemonic)
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)
    const a0 = (await addrGen(0)).address
    const a1 = (await addrGen(1)).address
    const a2 = (await addrGen(2)).address
    assert.notStrictEqual(a0, a1)
    assert.notStrictEqual(a1, a2)
    assert.equal(
      a1,
      'addr1qy430s2e40fv2m4n3qclfgzm5h8jhh0jvw3tlwc382g0zpetzlq4n27jc4ht8zp37js9hfw090wlycazh7a3zw5s7yrs4e2mxe'
    )
    assert.equal(
      a2,
      'addr1q9qhghd65zrsz93m0c3cqfp8ve5jfyuq30klr8up0fzzemzpw3wm4gy8qytrkl3rsqjzwenfyjfcpzld7x0cz7jy9nkqnf7r2s'
    )
  })
})
