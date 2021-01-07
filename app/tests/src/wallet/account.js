import {accountSettings} from '../common/account-settings'
import {Account} from '../../../frontend/wallet/account'

const accounts = []

const initAccount = async (settings, i) => {
  const {
    config,
    randomInputSeed,
    randomChangeSeed,
    type,
    derivationSchemeType,
    secret,
    accountIndex,
  } = settings

  let walletSecretDef
  if (type === 'walletSecretDef') {
    walletSecretDef = {
      rootSecret: Buffer.from(secret, 'hex'),
      derivationScheme: derivationSchemes[derivationSchemeType],
    }
  } else {
    walletSecretDef = await mnemonicToWalletSecretDef(secret)
  }

  const cryptoProvider = ShelleyJsCryptoProvider({
    walletSecretDef,
    network: cryptoSettings.network,
    config: {shouldExportPubKeyBulk},
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

describe('transaction plan calculation', () => {
  // it('should calculate simple tx plan', () => {
  //   assert.equal(null, null)
  // })
})
