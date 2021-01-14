import {h, Component, Fragment} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

import {getTranslation} from '../../../translations'
import {errorHasHelp} from '../../../helpers/errorsWithHelp'
import printAda from '../../../helpers/printAda'

import ConfirmTransactionDialog from './confirmTransactionDialog'
import DonateThanksModal from './donateThanksModal'
import TransactionErrorModal from './transactionErrorModal'
import DonationButtons from './donationButtons'
import CustomDonationInput from './customDonationInput'
import Conversions from '../../common/conversions'
import {ADALITE_CONFIG} from '../../../config'
import {toCoins} from '../../../helpers/adaConverters'

import tooltip from '../../common/tooltip'
import AccountDropdown from '../accounts/accountDropdown'
import {sourceAccountState, State} from '../../../state'

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
  transactionSubmissionError: any
  sendResponse: any
  sendAddress: any
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
  closeTransactionErrorModal: any
  shouldShowTransactionErrorModal: any
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

class SendAdaPage extends Component<Props> {
  amountField: HTMLInputElement
  submitTxBtn: HTMLButtonElement

  render({
    transactionSubmissionError,
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
    closeTransactionErrorModal,
    shouldShowTransactionErrorModal,
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
    const total = summary.amount + transactionFee + summary.donation

    const submitHandler = async () => {
      await confirmTransaction('send')
    }

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
        <div className="send-values">
          <label className="ada-label amount" htmlFor="send-amount">
            Amount
          </label>
          <div className="input-wrapper">
            <input
              className="input send-amount"
              id="send-amount"
              name="send-amount"
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
                Donate<a
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
              {!shouldShowCustomDonationInput &&
                isDonationSufficient && <DonationButtons isSendAddressValid={isSendAddressValid} />}
              {shouldShowCustomDonationInput &&
                isDonationSufficient && (
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
        {shouldShowTransactionErrorModal && ( // TODO: move to dashboardPage
          <TransactionErrorModal
            onRequestClose={closeTransactionErrorModal}
            errorMessage={getTranslation(
              transactionSubmissionError.code,
              transactionSubmissionError.params
            )}
            showHelp={errorHasHelp(transactionSubmissionError.code)}
          />
        )}
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
  title: 'Send ADA',
}

export default connect(
  (state: State) => ({
    transactionSubmissionError: state.transactionSubmissionError,
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddressValidationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmountValidationError,
    sendAmount: state.sendAmount.fieldValue,
    donationAmountValidationError: state.donationAmountValidationError,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    shouldShowTransactionErrorModal: state.shouldShowTransactionErrorModal,
    feeRecalculating: state.calculatingFee,
    shouldShowThanksForDonation: state.shouldShowThanksForDonation,
    coinsAmount: state.sendAmount.coins,
    shouldShowCustomDonationInput: state.shouldShowCustomDonationInput,
    maxDonationAmount: state.maxDonationAmount,
    conversionRates: state.conversionRates && state.conversionRates.data,
    sendTransactionSummary: state.sendTransactionSummary,
    transactionFee: state.transactionFee,
    txSuccessTab: state.txSuccessTab,
    balance: sourceAccountState(state).balance,
    sourceAccountIndex: state.sourceAccountIndex,
    targetAccountIndex: state.targetAccountIndex,
  }),
  actions
)(SendAdaPage)
