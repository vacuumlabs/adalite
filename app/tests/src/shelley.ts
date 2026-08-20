/* eslint-disable max-len */
import * as assert from 'assert'

import ShelleyJsCryptoProvider from '../../frontend/wallet/shelley/shelley-js-crypto-provider'

import {ShelleyBaseAddressProvider} from '../../frontend/wallet/shelley/shelley-address-provider'
import {isShelleyPath} from '../../frontend/wallet/shelley/helpers/addresses'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {HARDENED_THRESHOLD, NETWORKS} from '../../frontend/wallet/constants'
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
    twelveWordDerivation: 'exodus',
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

  it('should use Icarus (v2) derivation for 12-word mnemonic when selected', async () => {
    const walletSecretDef = await mnemonicToWalletSecretDef(mnemonic12Words, {
      twelveWordDerivation: 'icarus',
    })
    assert.equal(walletSecretDef.derivationScheme.type, 'v2')
    const cp = await ShelleyJsCryptoProvider({
      walletSecretDef,
      network: {networkId: NetworkId.TESTNETS} as Network,
      config: {shouldExportPubKeyBulk: true},
    })
    const {address} = await ShelleyBaseAddressProvider(cp, 0, false)(0)
    assert.equal(
      address,
      'addr_test1qq8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mqkt5dmn'
    )
  })
})

describe('isShelleyPath', () => {
  const H = HARDENED_THRESHOLD

  it('should treat CIP-1852 paths as Shelley', () => {
    assert.equal(isShelleyPath([H + 1852, H + 1815, H, 0, 0]), true)
  })

  it('should not treat Byron BIP44 paths as Shelley', () => {
    assert.equal(isShelleyPath([H + 44, H + 1815, H, 0, 0]), false)
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

  // AdaLite only discovers address #0 for Exodus; this checks HD derivation still works for later slots.
  it("should derive distinct receive addresses at m/44'/1815'/{n}'/0/0", async () => {
    const cp = await getExodusCryptoProvider(exodusMnemonic)
    const addrGen = ShelleyBaseAddressProvider(cp, 0, false)
    const a0 = (await addrGen(0)).address
    const a1 = (await addrGen(1)).address
    assert.notStrictEqual(a0, a1)
    assert.equal(
      a1,
      'addr1qy430s2e40fv2m4n3qclfgzm5h8jhh0jvw3tlwc382g0zpetzlq4n27jc4ht8zp37js9hfw090wlycazh7a3zw5s7yrs4e2mxe'
    )
  })

  it('should refuse to construct Exodus crypto provider without BIP39 seed', async () => {
    const walletSecretDef = await mnemonicToWalletSecretDef(exodusMnemonic, {
      twelveWordDerivation: 'exodus',
    })
    delete walletSecretDef.exodusBip39Seed
    await assert.rejects(
      () =>
        ShelleyJsCryptoProvider({
          walletSecretDef,
          network: NETWORKS.MAINNET,
          config: {shouldExportPubKeyBulk: true},
        }),
      /require a BIP39 seed/
    )
  })
})
