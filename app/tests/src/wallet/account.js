import assert from 'assert'
import {accountSettings} from '../common/account-settings'
import {Account} from '../../../frontend/wallet/account'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import BlockchainExplorer from '../../../frontend/wallet/blockchain-explorer'
import ShelleyJsCryptoProvider from '../../../frontend/wallet/shelley/shelley-js-crypto-provider'
import {ADALITE_CONFIG} from '../../../frontend/config'
import {transactionSettings} from '../common/tx-settings'
import mockNetwork from '../common/mock'

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

before(async () => {
  ADALITE_CONFIG.ADALITE_CARDANO_VERSION = 'shelley'
  ADALITE_CONFIG.ADALITE_NETWORK = 'MAINNET'
  const mockNet = mockNetwork(ADALITE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()
  mockNet.mockUtxoEndpoint()
  mockNet.mockPoolMeta()
  mockNet.mockGetAccountState()
  mockNet.mockAccountDelegationHistory()
  mockNet.mockAccountStakeRegistrationHistory()
  mockNet.mockWithdrawalHistory()
  mockNet.mockRewardHistory()
  mockNet.mockPoolRecommendation()

  await Promise.all(
    Object.entries(accountSettings).map(async ([name, setting]) => {
      accounts[name] = await initAccount(setting)
    })
  )
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

describe('Tx plan', () => {
  Object.entries(transactionSettings).forEach(([name, setting]) =>
    it(`should create the right tx plan for tx with ${name}`, async () => {
      const account = await accounts.ShelleyAccount0
      const txPlanResult = await account.getTxPlan({...setting.args})
      assert.deepEqual(txPlanResult, setting.txPlanResult)
    })
  )
})

describe('TxAux', () => {
  Object.entries(transactionSettings).forEach(([name, setting]) =>
    it(`should calcualte the right tx hash for tx with ${name}`, async () => {
      const account = await accounts.ShelleyAccount0
      const txHash = (await account.prepareTxAux(setting.txPlanResult.txPlan, setting.ttl)).getId()
      assert.deepEqual(txHash, setting.txHash)
    })
  )
})
