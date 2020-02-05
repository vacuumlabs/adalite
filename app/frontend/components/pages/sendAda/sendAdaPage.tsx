import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
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

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

const SendFormErrorMessage = ({sendFormValidationError}) => (
  <span>{getTranslation(sendFormValidationError.code, sendFormValidationError.params)}</span>
)

const SendValidation = ({sendFormValidationError, sendResponse}) =>
  sendFormValidationError ? (
    <div className="validation-message send error">
      <SendFormErrorMessage sendFormValidationError={sendFormValidationError} />
    </div>
  ) : (
    sendResponse &&
    sendResponse.success && (
      <div className="validation-message transaction-success">Transaction successful!</div>
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
  showConfirmTransactionDialog: any
  feeRecalculating: any
  sendMaxFunds: any
  showThanksForDonation: any
  closeThanksForDonationModal: any
  closeTransactionErrorModal: any
  showTransactionErrorModal: any
  coinsAmount: any
  showCustomDonationInput: any
  maxDonationAmount: any
  conversionRates: any
  sendTransactionSummary: any
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
    showConfirmTransactionDialog,
    feeRecalculating,
    sendMaxFunds,
    showThanksForDonation,
    closeThanksForDonationModal,
    closeTransactionErrorModal,
    showTransactionErrorModal,
    coinsAmount,
    showCustomDonationInput,
    maxDonationAmount,
    conversionRates,
    sendTransactionSummary: summary,
  }) {
    const sendFormValidationError =
      sendAddressValidationError || sendAmountValidationError || donationAmountValidationError

    const enableSubmit = sendAmount && sendAddress && !sendFormValidationError
    const isDonationSufficient = maxDonationAmount >= toCoins(ADALITE_MIN_DONATION_VALUE)
    const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''
    const total = summary.amount + summary.fee + summary.donation

    const submitHandler = async () => {
      await confirmTransaction(sendAddress, coinsAmount)
    }

    return (
      <div className="send card">
        <h2 className="card-title">Send ADA</h2>
        <input
          type="text"
          id="send-address"
          className="input send-address fullwidth"
          name="send-address"
          placeholder="Receiving address"
          value={sendAddress}
          onInput={updateAddress}
          autoComplete="off"
          onKeyDown={(e) => e.key === 'Enter' && this.amountField.focus()}
        />
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
              disabled={!isSendAddressValid}
            >
              Max
            </button>
          </div>
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
          {!showCustomDonationInput &&
            isDonationSufficient && <DonationButtons isSendAddressValid={isSendAddressValid} />}
          {showCustomDonationInput &&
            isDonationSufficient && <CustomDonationInput isSendAddressValid={isSendAddressValid} />}
          <div className="ada-label">Fee</div>
          <div className="send-fee">{printAda(summary.fee)}</div>
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
              sendResponse={sendResponse}
            />
          )}
        </div>
        {showTransactionErrorModal && (
          <TransactionErrorModal
            onRequestClose={closeTransactionErrorModal}
            errorMessage={getTranslation(
              transactionSubmissionError.code,
              transactionSubmissionError.params
            )}
            showHelp={errorHasHelp(transactionSubmissionError.code)}
          />
        )}
        {showConfirmTransactionDialog && <ConfirmTransactionDialog />}
        {showThanksForDonation && (
          <DonateThanksModal closeThanksForDonationModal={closeThanksForDonationModal} />
        )}
      </div>
    )
  }
}

export default connect(
  (state) => ({
    transactionSubmissionError: state.transactionSubmissionError,
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddressValidationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmountValidationError,
    sendAmount: state.sendAmount.fieldValue,
    donationAmountValidationError: state.donationAmountValidationError,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    showTransactionErrorModal: state.showTransactionErrorModal,
    feeRecalculating: state.calculatingFee,
    showThanksForDonation: state.showThanksForDonation,
    coinsAmount: state.sendAmount.coins,
    showCustomDonationInput: state.showCustomDonationInput,
    maxDonationAmount: state.maxDonationAmount,
    conversionRates: state.conversionRates && state.conversionRates.data,
    sendTransactionSummary: state.sendTransactionSummary,
  }),
  actions
)(SendAdaPage)
