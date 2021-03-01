import {setMockState, setupInitialMockState} from './actions'
import {ADALITE_CONFIG} from '../../../frontend/config'
import mockNetwork from '../common/mock'
import {CryptoProviderType} from '../../../frontend/wallet/types'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import assert from 'assert'
import {walletSettings} from '../common/wallet-settings'
import {AssetFamily} from '../../../frontend/types'

let state, action

beforeEach(() => {
  ;[state, action] = setupInitialMockState()
})

before(() => {
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
})

const loadTestWallet = async (mockState) => {
  await action.loadWallet(state, {
    cryptoProviderType: CryptoProviderType.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(walletSettings.Shelley15Word.secret),
  })
  setMockState(state, mockState)
}

const sendAdaTxSettings = {
  donation: {
    state: {
      sendAddress: {
        fieldValue:
          'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      },
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '1', coins: 1500000},
    },
    sendTransactionSummary: {
      amount: 1000000,
      donation: 5000000,
      fee: 170850,
      plan: {},
      tab: 'send',
      deposit: 0,
    },
  },
}

const delegationSettings = {
  delegation: {
    state: {
      activeMainTab: 'Staking',
      shelleyDelegation: {
        selectedPool: {
          poolHash: '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
        },
      },
    },
    sendTransactionSummary: {
      amount: 0,
      donation: 0,
      fee: 183990,
      plan: {},
      tab: 'stake',
      deposit: 2000000,
    },
  },
}

const withdrawalSettings = {
  rewardWithdrawal: {
    state: {},
    sendTransactionSummary: {
      amount: 0,
      donation: 0,
      fee: 175157,
      plan: {},
      tab: 'withdraw',
      deposit: 0,
    },
  },
}

describe('Send ADA fee calculation', () => {
  Object.entries(sendAdaTxSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      await action.calculateFee()
      assert.deepEqual(state.sendTransactionSummary.fee, setting.sendTransactionSummary.fee)
    })
  )
})

describe('Delegation fee calculation', () => {
  Object.entries(delegationSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      await action.calculateDelegationFee(setting.state)
      assert.deepEqual(state.sendTransactionSummary.fee, setting.sendTransactionSummary.fee)
    })
  )
})

describe('Withdrawal fee calculation', () => {
  Object.entries(withdrawalSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      await action.withdrawRewards(state)
      assert.deepEqual(state.sendTransactionSummary.fee, setting.sendTransactionSummary.fee)
    })
  )
})
