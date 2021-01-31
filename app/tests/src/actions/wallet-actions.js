import mockNetwork from '../common/mock'
import {ADALITE_CONFIG} from '../../../frontend/config'
import {CryptoProviderType} from '../../../frontend/wallet/constants'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import assert from 'assert'
import {assertPropertiesEqual, setupInitialState} from './actions'
import {walletSettings} from '../common/wallet-settings'

let state, action

beforeEach(() => {
  ;[state, action] = setupInitialState()
})

const expectedStateChanges = {
  walletIsLoaded: true,
  loading: false,
  mnemonicAuthForm: {
    mnemonicInputValue: '',
    mnemonicInputError: null,
    formIsValid: false,
  },
  usingHwWallet: false,
  hwWalletName: undefined,
  isDemoWallet: false,
  shouldShowDemoWalletWarningDialog: false,
  shouldShowGenerateMnemonicDialog: false,
  // send form
  sendAmount: {fieldValue: '', coins: 0},
  sendAddress: {fieldValue: ''},
  donationAmount: {fieldValue: '', coins: 0},
  sendResponse: '',
  ticker2Id: null,
  validStakepools: [
    {
      pool_id: 'd4b1243dfc0bec57f146a90d85b478cdd3e0e646c43801c2bebd6792580a7db2',
      owner: 'def7e265ec2c54e1cf00dae85ec407e823dd1374e6520cd59264df321513ffe5',
      name: 'IOHK Stakepool',
      description: null,
      ticker: 'IOHK1',
      homepage: 'https://staking.cardano.org',
      rewards: {
        fixed: 258251123,
        ratio: [2, 25],
        limit: null,
      },
    },
  ],
}

it('Should properly load shelley wallet', async () => {
  ADALITE_CONFIG.ADALITE_CARDANO_VERSION = 'shelley'
  ADALITE_CONFIG.ADALITE_NETWORK = 'MAINNET'
  const mockNet = mockNetwork(ADALITE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()
  mockNet.mockPoolMeta()
  mockNet.mockGetAccountState()
  mockNet.mockAccountDelegationHistory()
  mockNet.mockAccountStakeRegistrationHistory()
  mockNet.mockWithdrawalHistory()
  mockNet.mockRewardHistory()
  mockNet.mockPoolRecommendation()

  await action.loadWallet(state, {
    cryptoProviderType: CryptoProviderType.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(walletSettings[0].secret),
    shouldExportPubKeyBulk: true,
  })
  assertPropertiesEqual(state, expectedStateChanges)
  assert.equal(state.accountsInfo[0].visibleAddresses.length, 20)

  mockNet.clean()
})
