import {accountSettings} from '../common/account-settings'
import {Account} from '../../../frontend/wallet/account'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import BlockchainExplorer from '../../../frontend/wallet/blockchain-explorer'
import ShelleyJsCryptoProvider from '../../../frontend/wallet/shelley/shelley-js-crypto-provider'
import {ADALITE_CONFIG} from '../../../frontend/config'
import assert from 'assert'

const accounts = []

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

  accounts.push(
    Account({
      config,
      randomInputSeed,
      randomChangeSeed,
      cryptoProvider,
      blockchainExplorer,
      accountIndex,
    })
  )
}

before(async () => {
  await Promise.all(accountSettings.map(initAccount))
})

describe('Account info', () => {
  accountSettings.map((setting, i) =>
    it('should get the right account xpubs for account', async () => {
      const xpubs = await accounts[i]._getAccountXpubs()
      assert.deepEqual(xpubs, setting.accountXpubs)
    })
  )
})
