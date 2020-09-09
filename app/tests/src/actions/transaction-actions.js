import {setupInitialState} from './actions'
import {ADALITE_CONFIG} from '../../../frontend/config'
import mockNetwork from '../common/mock'
import {CRYPTO_PROVIDER_TYPES} from '../../../frontend/wallet/constants'
import mnemonicToWalletSecretDef from '../../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import assert from 'assert'

let state, action

beforeEach(() => {
  ;[state, action] = setupInitialState()
})

it('Calculate fee - shelley', async () => {
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

  await action.loadWallet(state, {
    cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon address'
    ),
  })

  state.sendAddress.fieldValue =
    'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0'
  state.sendAmount.fieldValue = 1
  state.sendAmount.coins = 1000000
  state.donationAmount.fieldValue = 5
  state.donationAmount.coins = 5000000

  await action.calculateFee()

  assert.equal(state.transactionFee, 183419)

  mockNet.clean()
})
