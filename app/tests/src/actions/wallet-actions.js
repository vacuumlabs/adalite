import mockNetwork from '../common/mock'
import {ADALITE_CONFIG} from '../../../frontend/config'
import {CRYPTO_PROVIDER_TYPES} from '../../../frontend/wallet/constants'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import assert from 'assert'
import {assertPropertiesEqual, setupState} from './actions'

let state, action

beforeEach(() => {
  ;[state, action] = setupState()
})

const expectedStateChanges = {
  walletIsLoaded: true,
  balance: 1500000,
  loading: false,
  mnemonicAuthForm: {
    mnemonicInputValue: '',
    mnemonicInputError: null,
    formIsValid: false,
  },
  usingHwWallet: false,
  hwWalletName: undefined,
  isDemoWallet: false,
  showDemoWalletWarningDialog: false,
  showGenerateMnemonicDialog: false,
  // send form
  sendAmount: {fieldValue: '', coins: 0},
  sendAddress: {fieldValue: ''},
  donationAmount: {fieldValue: '', coins: 0},
  sendResponse: '',
}

it('Load shelley wallet', async () => {
  ADALITE_CONFIG.ADALITE_CARDANO_VERSION = 'shelley'

  const mockNet = mockNetwork(ADALITE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()

  expectedStateChanges.validStakepools = {
    d4b1243dfc0bec57f146a90d85b478cdd3e0e646c43801c2bebd6792580a7db2: {
      pool_id: 'd4b1243dfc0bec57f146a90d85b478cdd3e0e646c43801c2bebd6792580a7db2',
      owner: 'def7e265ec2c54e1cf00dae85ec407e823dd1374e6520cd59264df321513ffe5',
      name: 'IOHK Stakepool',
      description: null,
      ticker: 'IOHK1',
      homepage: 'https://staking.cardano.org',
      rewards: {
        fixed: 258251123,
        limit: null,
        ratio: [2, 25],
      },
    },
  }
  expectedStateChanges.ticker2Id = {
    IOHK1: 'd4b1243dfc0bec57f146a90d85b478cdd3e0e646c43801c2bebd6792580a7db2',
  }

  await action.loadWallet(state, {
    cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(
      'blame matrix water coil diet seat nerve street movie turkey jump bundle'
    ),
  })
  assertPropertiesEqual(state, expectedStateChanges)
  assert.equal(state.visibleAddresses.length, 40)
})

it('Load byron wallet', async () => {
  ADALITE_CONFIG.ADALITE_CARDANO_VERSION = 'byron'

  const mockNet = mockNetwork(ADALITE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()

  expectedStateChanges.validStakepools = null
  expectedStateChanges.ticker2Id = null

  await action.loadWallet(state, {
    cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(
      'blame matrix water coil diet seat nerve street movie turkey jump bundle'
    ),
  })
  assertPropertiesEqual(state, expectedStateChanges)
  assert.equal(state.visibleAddresses.length, 10)
})
