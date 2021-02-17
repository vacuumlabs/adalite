import {h, Component, Fragment} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

import {getTranslation} from '../../../translations'
import printAda from '../../../helpers/printAda'

import ConfirmTransactionDialog from './confirmTransactionDialog'
import DonateThanksModal from './donateThanksModal'
import DonationButtons from './donationButtons'
import CustomDonationInput from './customDonationInput'
import Conversions from '../../common/conversions'
import SearchableSelect from '../../common/searchableSelect'
import {ADALITE_CONFIG} from '../../../config'
import {toCoins} from '../../../helpers/adaConverters'

import tooltip from '../../common/tooltip'
import AccountDropdown from '../accounts/accountDropdown'
import {getSourceAccountInfo, State} from '../../../state'
import {useCallback} from 'preact/hooks'
import {Lovelace} from '../../../../frontend/types'
import {StarIcon} from '../../common/svg'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

const SendFormErrorMessage = ({sendFormValidationError}) => (
  <span>{getTranslation(sendFormValidationError.code, sendFormValidationError.params)}</span>
)

const SendValidation = ({sendFormValidationError, txSuccessTab}) =>
  txSuccessTab === 'send' && !sendFormValidationError ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    sendFormValidationError && (
      <div className="validation-message send error">
        <SendFormErrorMessage sendFormValidationError={sendFormValidationError} />
      </div>
    )
  )

interface Props {
  sendResponse: any
  sendAddress: string
  sendAddressValidationError: any
  sendAmount: any
  sendAmountValidationError: any
  donationAmountValidationError: any
  updateAddress: any
  updateAmount: any
  confirmTransaction: any
  shouldShowConfirmTransactionDialog: any
  feeRecalculating: any
  sendMaxFunds: any
  shouldShowThanksForDonation: any
  closeThanksForDonationModal: any
  coinsAmount: any
  shouldShowCustomDonationInput: any
  maxDonationAmount: any
  conversionRates: any
  sendTransactionSummary: any
  transactionFee: any
  balance: any
  showDonationFields: boolean
  isModal: boolean
  title: string
  sourceAccountIndex: number
  targetAccountIndex: number
  setSourceAccount: any
  setTargetAccount: any
  switchSourceAndTargetAccounts: any
}

type MultiAsset = {
  name: string
  hash?: string
  amount: number
  star: boolean
}

// mock
const multiAssets: MultiAsset[] = [
  {
    name: 'ADA',
    amount: 10000000,
    star: true,
  },
  {
    name: 'Testcoin',
    hash: '95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39',
    amount: 10000000,
    star: true,
  },
  {
    name: 'Testcoin 2',
    hash: '95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39',
    amount: 10000000,
    star: false,
  },
  ...[...Array(43).keys()].map((i) => ({
    name: `Random coin ${i}`,
    hash: [...Array(56).keys()].map(() => Math.floor(Math.random() * 15).toString(16)).join(''),
    amount: Math.random() * 100000000,
    star: Math.random() < 0.5,
  })),
]

const showMultiAsset = ({star, name, hash, amount}: MultiAsset) => (
  <div className="multi-asset-item">
    <div className="multi-asset-name-amount">
      <div className="multi-asset-name">
        {star && <StarIcon />}
        {name}
      </div>
      <div className="multi-asset-amount">{printAda(Math.abs(amount) as Lovelace)}</div>
    </div>
    {hash && (
      <div className="multi-asset-hash">
        <span className="ellipsis">{hash.slice(0, -6)}</span>
        <span>{hash.slice(-6)}</span>
      </div>
    )}
  </div>
)

class SendAdaPage extends Component<Props> {
  amountField: HTMLInputElement
  submitTxBtn: HTMLButtonElement

  render({
    sendResponse,
    sendAddress,
    sendAddressValidationError,
    sendAmount,
    sendAmountValidationError,
    donationAmountValidationError,
    updateAddress,
    updateAmount,
    confirmTransaction,
    shouldShowConfirmTransactionDialog,
    feeRecalculating,
    sendMaxFunds,
    shouldShowThanksForDonation,
    closeThanksForDonationModal,
    coinsAmount,
    shouldShowCustomDonationInput,
    maxDonationAmount,
    conversionRates,
    sendTransactionSummary: summary,
    transactionFee,
    txSuccessTab,
    balance,
    showDonationFields,
    isModal, // TODO: remove
    title,
    sourceAccountIndex,
    targetAccountIndex,
    setSourceAccount,
    setTargetAccount,
    switchSourceAndTargetAccounts,
  }) {
    const sendFormValidationError =
      sendAddressValidationError || sendAmountValidationError || donationAmountValidationError

    const enableSubmit = sendAmount && sendAddress && !sendFormValidationError
    const isDonationSufficient = maxDonationAmount >= toCoins(ADALITE_MIN_DONATION_VALUE)
    const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''
    const total = summary.amount + transactionFee + summary

    const submitHandler = async () => {
      await confirmTransaction('send')
    }

    const searchPredicate = useCallback(
      (query: string, multiAsset: MultiAsset): boolean =>
        multiAsset.name.toLowerCase().includes(query.toLowerCase()) ||
        (multiAsset.hash && multiAsset.hash.toLowerCase().includes(query.toLowerCase())),
      []
    )

    return (
      <div className="send card">
        <h2 className={`card-title ${isModal ? 'show' : ''}`}>{title}</h2>
        {!isModal && (
          <input
            type="text"
            id="send-address"
            className={`input ${isModal ? '' : 'send-address'} fullwidth`}
            name="send-address"
            placeholder="Receiving address"
            value={sendAddress}
            onInput={updateAddress}
            autoComplete="off"
            onKeyDown={(e) => e.key === 'Enter' && this.amountField.focus()}
            disabled={isModal}
          />
        )}
        {isModal && (
          <div className="send-values dropdowns">
            <label className="account-label">From</label>
            <AccountDropdown accountIndex={sourceAccountIndex} setAccountFunc={setSourceAccount} />
            <button className="button account-switch" onClick={switchSourceAndTargetAccounts}>
              Switch
            </button>
            <div />
            <label className="account-label">To</label>
            <AccountDropdown accountIndex={targetAccountIndex} setAccountFunc={setTargetAccount} />
          </div>
        )}
        <SearchableSelect
          label="Select asset"
          defaultItem={multiAssets[0]}
          displaySelectedItem={(multiAsset: MultiAsset) => `${multiAsset.name}`}
          displaySelectedItemClassName="input"
          items={multiAssets}
          displayItem={(multiAsset: MultiAsset) => showMultiAsset(multiAsset)}
          onSelect={() => {
            return
          }}
          searchPredicate={searchPredicate}
          searchPlaceholder={`Search from ${multiAssets.length} tokens by name or hash`}
        />
        <div className="send-values">
          <label className="ada-label amount" htmlFor={`${isModal ? 'account' : ''}send-amount`}>
            Amount
          </label>
          <div className="input-wrapper">
            <input
              className="input send-amount"
              id={`${isModal ? 'account' : ''}send-amount`}
              name={`${isModal ? 'account' : ''}send-amount`}
              placeholder="0.000000"
              value={sendAmount}
              onInput={updateAmount}
              autoComplete="off"
              ref={(element) => {
                this.amountField = element
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && this.submitTxBtn) {
                  this.submitTxBtn.click()
                  e.preventDefault()
                }
              }}
            />
            <button
              className="button send-max"
              onClick={sendMaxFunds}
              disabled={!isSendAddressValid || !balance}
            >
              Max
            </button>
          </div>
          {showDonationFields && (
            <Fragment>
              <label className="ada-label amount donation" htmlFor="donation-amount">
                Donate
                <a
                  {...tooltip(
                    'Your donation is very much appreciated and will be used for further development of AdaLite',
                    true
                  )}
                >
                  <span className="show-info">{''}</span>
                </a>
              </label>
              {!isDonationSufficient && (
                <div className="send-donate-msg">Insufficient balance for a donation.</div>
              )}
              {!shouldShowCustomDonationInput && isDonationSufficient && (
                <DonationButtons isSendAddressValid={isSendAddressValid} />
              )}
              {shouldShowCustomDonationInput && isDonationSufficient && (
                <CustomDonationInput isSendAddressValid={isSendAddressValid} />
              )}
            </Fragment>
          )}
          <div className="ada-label">Fee</div>
          <div className="send-fee">{printAda(transactionFee)}</div>
        </div>
        <div className="send-total">
          <div className="send-total-title">Total</div>
          <div className="send-total-inner">
            <div className="send-total-ada">{printAda(total)}</div>
            {conversionRates && <Conversions balance={total} conversionRates={conversionRates} />}
          </div>
        </div>
        <div className="validation-row">
          <button
            className="button primary"
            disabled={!enableSubmit || feeRecalculating}
            onClick={submitHandler}
            ref={(element) => {
              this.submitTxBtn = element
            }}
          >
            Send ADA
          </button>
          {feeRecalculating ? (
            <CalculatingFee />
          ) : (
            <SendValidation
              sendFormValidationError={sendFormValidationError}
              txSuccessTab={txSuccessTab}
            />
          )}
        </div>
        {shouldShowConfirmTransactionDialog && !isModal && <ConfirmTransactionDialog />}
        {shouldShowThanksForDonation && (
          <DonateThanksModal closeThanksForDonationModal={closeThanksForDonationModal} />
        )}
      </div>
    )
  }
}

SendAdaPage.defaultProps = {
  showDonationFields: true,
  isModal: false,
  title: 'Send',
}

export default connect(
  (state: State) => ({
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddressValidationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmountValidationError,
    sendAmount: state.sendAmount.fieldValue,
    donationAmountValidationError: state.donationAmountValidationError,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    feeRecalculating: state.calculatingFee,
    shouldShowThanksForDonation: state.shouldShowThanksForDonation,
    coinsAmount: state.sendAmount.coins,
    shouldShowCustomDonationInput: state.shouldShowCustomDonationInput,
    maxDonationAmount: state.maxDonationAmount,
    conversionRates: state.conversionRates && state.conversionRates.data,
    sendTransactionSummary: state.sendTransactionSummary,
    transactionFee: state.transactionFee,
    txSuccessTab: state.txSuccessTab,
    balance: getSourceAccountInfo(state).balance,
    sourceAccountIndex: state.sourceAccountIndex,
    targetAccountIndex: state.targetAccountIndex,
  }),
  actions
)(SendAdaPage)
