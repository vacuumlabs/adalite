import assert from 'assert'
import {accountSettings} from '../common/account-settings'
import {Account} from '../../../frontend/wallet/account'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import BlockchainExplorer from '../../../frontend/wallet/blockchain-explorer'
import ShelleyJsCryptoProvider from '../../../frontend/wallet/shelley/shelley-js-crypto-provider'
import {ADALITE_CONFIG} from '../../../frontend/config'

const accounts = {}

const initAccount = async (settings, i) => {
  const {
    network,
    randomInputSeed,
    randomChangeSeed,
    type,
    derivationSchemeType,
    secret,
    accountIndex,
    shouldExportPubKeyBulk,
    isShelleyCompatible,
  } = settings
  const config = {...ADALITE_CONFIG, isShelleyCompatible, shouldExportPubKeyBulk}
  const blockchainExplorer = BlockchainExplorer(ADALITE_CONFIG, {})

  let walletSecretDef
  if (type === 'walletSecretDef') {
    walletSecretDef = {
      rootSecret: Buffer.from(secret, 'hex'),
      derivationScheme: derivationSchemes[derivationSchemeType],
    }
  } else {
    walletSecretDef = await mnemonicToWalletSecretDef(secret)
  }

  const cryptoProvider = await ShelleyJsCryptoProvider({
    walletSecretDef,
    network,
    config,
  })

  return Account({
    config,
    randomInputSeed,
    randomChangeSeed,
    cryptoProvider,
    blockchainExplorer,
    accountIndex,
  })
}

before(() => {
  Object.entries(accountSettings).forEach(([name, setting]) => {
    accounts[name] = initAccount(setting)
  })
})

describe('Account info', () => {
  Object.entries(accountSettings).forEach(([name, setting]) =>
    it(`should get the right account xpubs for ${name}`, async () => {
      const account = await accounts[name]
      const xpubs = await account._getAccountXpubs()
      assert.deepEqual(xpubs, setting.accountXpubs)
    })
  )
})
