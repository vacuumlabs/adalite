import {AccountManager} from '../../../frontend/wallet/account-manager'

const accountManagers = []

const initAccountManager = async (settings, i) => {
  const {config, type, derivationSchemeType, secret} = settings

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

  accountManagers.push(AccountManager({config, cryptoProvider, blockchainExplorer}))
}

before(async () => {
  await Promise.all(accountSettings.map(initAccountManager))
})

describe('transaction plan calculation', () => {
  // it('should calculate simple tx plan', () => {
  //   assert.equal(null, null)
  // })
})
