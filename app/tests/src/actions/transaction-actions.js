import {setMockState, setupInitialMockState} from './actions'
import {ADALITE_CONFIG} from '../../../frontend/config'
import mockNetwork from '../common/mock'
import {CryptoProviderType} from '../../../frontend/wallet/types'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import assert from 'assert'
import {walletSettings} from '../common/wallet-settings'
import {AssetFamily, TxType} from '../../../frontend/types'

let state, action

beforeEach(() => {
  ;[state, action] = setupInitialMockState()
})

before(() => {
  ADALITE_CONFIG.ADALITE_NETWORK = 'MAINNET'
  const mockNet = mockNetwork(ADALITE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockLoadCurrentState()
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
  mockNet.mockTokenRegistry()
})

const loadTestWallet = async (mockState) => {
  await action.loadWallet(state, {
    cryptoProviderType: CryptoProviderType.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(walletSettings.Shelley15Word.secret),
  })
  setMockState(state, mockState)
}

const sendAdaTxSettings = {
  sendAda: {
    state: {
      sendAddress: {
        fieldValue:
          'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
      },
      sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '1', coins: 1500000},
    },
    sendTransactionSummary: {
      fee: 177882,
    },
  },
  // TODO:
  // sendToken: {
  //   sendAddress: {
  //     fieldValue:
  //       'addr1qjag9rgwe04haycr283datdrjv3m
  //lttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0',
  //   },
  //   state: {
  //     sendAmount: {assetFamily: AssetFamily.TOKEN, fieldValue: '2', token: {
  //       policyId: 'ca37dd6b151b6a1d023ecbd22d7e881d814b0c58a3a3148b42b865a0',
  //       assetName: '7365636f6e646173736574',
  //       quantity: 2,
  //     }},
  //   },
  //   sendTransactionSummary: {
  //     fee: 176871,
  //   },
  // },
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
      fee: 191022,
    },
  },
}

const withdrawalSettings = {
  rewardWithdrawal: {
    state: {},
    sendTransactionSummary: {
      fee: 182189,
    },
  },
}

const votingSettings = {
  voting: {
    state: {},
    votingPubKey: '2145823c77df07a43210af5422e6447bb4d1f44f1af81a261205146cc67d2cf0',
    sendTransactionSummary: {
      fee: 182804,
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
      assert.deepEqual(
        state.cachedTransactionSummaries[TxType.DELEGATE].fee,
        setting.sendTransactionSummary.fee
      )
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

describe('Voting fee calculation', () => {
  Object.entries(votingSettings).forEach(([name, setting]) =>
    it(`should calculate fee for tx with ${name}`, async () => {
      await loadTestWallet(setting.state)
      await action.registerVotingKey(state, {votingPubKey: setting.votingPubKey})
      assert.deepEqual(
        state.cachedTransactionSummaries[TxType.REGISTER_VOTING].fee,
        setting.sendTransactionSummary.fee
      )
    })
  )
})
