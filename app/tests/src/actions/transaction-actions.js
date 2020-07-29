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

it('Calculate fee - byron', async () => {
  ADALITE_CONFIG.ADALITE_CARDANO_VERSION = 'byron'
  const mockNet = mockNetwork(ADALITE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()
  mockNet.mockUtxoEndpoint()
  await action.loadWallet(state, {
    cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(
      'blame matrix water coil diet seat nerve street movie turkey jump bundle'
    ),
  })

  state.sendAddress.fieldValue =
    'DdzFFzCqrhsvrNGcR93DW8cmrPVVbP6vFxcL1i92WzvqcHrp1K1of4DQ8t8cr3oQgsMbbY1eXKWhrcpfnTohNqrr6zPdLeE3AYBtxxZZ'
  state.sendAmount.fieldValue = 10
  state.sendAmount.coins = 10000000
  state.donationAmount.fieldValue = 5
  state.donationAmount.coins = 5000000

  await action.calculateFee()
  assert.equal(state.transactionFee, 179288)
})

it('Calculate fee - shelley', async () => {
  ADALITE_CONFIG.ADALITE_CARDANO_VERSION = 'shelley'
  ADALITE_CONFIG.ADALITE_NETWORK = 'INCENTIVIZED_TESTNET'
  const mockNet = mockNetwork(ADALITE_CONFIG)
  mockNet.mockBulkAddressSummaryEndpoint()
  mockNet.mockGetAccountInfo()
  mockNet.mockGetStakePools()
  mockNet.mockGetConversionRates()
  mockNet.mockUtxoEndpoint()
  await action.loadWallet(state, {
    cryptoProviderType: CRYPTO_PROVIDER_TYPES.WALLET_SECRET,
    walletSecretDef: await mnemonicToWalletSecretDef(
      'blame matrix water coil diet seat nerve street movie turkey jump bundle'
    ),
  })

  state.sendAddress.fieldValue =
    'addr1qjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsgds90s0'
  state.sendAmount.fieldValue = 10
  state.sendAmount.coins = 10000000
  state.donationAmount.fieldValue = 5
  state.donationAmount.coins = 5000000

  await action.calculateFee()
  assert.equal(state.transactionFee, 163116)
})
