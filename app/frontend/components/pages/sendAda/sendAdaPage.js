import {h} from 'preact'
import {connect} from 'unistore/preact'
import actions from '../../../actions'

import {getTranslation} from '../../../translations'
import {errorHasHelp} from '../../../helpers/errorsWithHelp'
import printAda from '../../../helpers/printAda'

import ConfirmTransactionDialog from './confirmTransactionDialog'
import RawTransactionModal from './rawTransactionModal'
import DonateThanksModal from './donateThanksModal'
import TransactionErrorModal from './transactionErrorModal'
import DonationButtons from './donationButtons'
import CustomDonationInput from './customDonationInput'
import Conversions from '../../common/conversions'
import {ADALITE_CONFIG} from '../../../config'
import {toCoins} from '../../../helpers/adaConverters'

import tooltip from '../../common/tooltip'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG

const CalculatingFee = () => h('div', {class: 'validation-message send'}, 'Calculating fee...')

const SendFormErrorMessage = ({sendFormValidationError}) =>
  h('span', undefined, getTranslation(sendFormValidationError.code, sendFormValidationError.params))

const SendValidation = ({sendFormValidationError, sendResponse}) =>
  sendFormValidationError
    ? h(
      'div',
      {class: 'validation-message send error'},
      h(SendFormErrorMessage, {sendFormValidationError})
    )
    : sendResponse &&
      sendResponse.success &&
      h('div', {class: 'validation-message transaction-success'}, 'Transaction successful!')

const SendAdaPage = ({
  transactionSubmissionError,
  sendResponse,
  sendAddress,
  sendAddressValidationError,
  sendAmount,
  sendAmountValidationError,
  sendAmountForTransactionFee,
  donationAmountValidationError,
  updateAddress,
  updateAmount,
  transactionFee,
  confirmTransaction,
  showConfirmTransactionDialog,
  feeRecalculating,
  sendMaxFunds,
  showThanksForDonation,
  closeThanksForDonationModal,
  closeTransactionErrorModal,
  showTransactionErrorModal,
  getRawTransaction,
  rawTransactionOpen,
  rawTransaction,
  coinsAmount,
  showCustomDonationInput,
  maxDonationAmount,
  conversionRates,
  donationAmountForTransactionFee,
}) => {
  const sendFormValidationError =
    sendAddressValidationError || sendAmountValidationError || donationAmountValidationError

  const enableSubmit = sendAmount && sendAddress && !sendFormValidationError
  const isDonationSufficient = maxDonationAmount >= toCoins(ADALITE_MIN_DONATION_VALUE)
  const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''
  const total = sendAmountForTransactionFee + transactionFee + donationAmountForTransactionFee

  const rawTransactionHandler = async () => {
    await getRawTransaction(sendAddress, coinsAmount)
  }

  return h(
    'div',
    {class: 'send card'},
    h('h2', {class: 'card-title'}, 'Send ADA'),
    h('input', {
      type: 'text',
      id: 'send-address',
      class: 'input send-address fullwidth',
      name: 'send-address',
      placeholder: 'Receiving address',
      value: sendAddress,
      onInput: updateAddress,
      autocomplete: 'off',
      onKeyDown: (e) => e.key === 'Enter' && this.amountField.focus(),
    }),
    h(
      'div',
      {class: 'send-values'},
      h(
        'label',
        {
          class: 'ada-label amount',
          for: 'send-amount',
        },
        'Amount'
      ),
      h(
        'div',
        {class: 'input-wrapper'},
        h('input', {
          class: 'input send-amount',
          id: 'send-amount',
          name: 'send-amount',
          placeholder: '0.000000',
          value: sendAmount,
          onInput: updateAmount,
          ref: (element) => {
            this.amountField = element
          },
          onKeyDown: (e) => {
            if (e.key === 'Enter' && this.submitTxBtn) {
              this.submitTxBtn.click()
              e.preventDefault()
            }
          },
        }),
        h(
          'button',
          {
            class: 'button send-max',
            onClick: sendMaxFunds,
            disabled: !isSendAddressValid,
          },
          'Max'
        )
      ),
      h(
        'label',
        {
          class: 'ada-label amount donation',
          for: 'donation-amount',
        },
        'Donate',
        h(
          'a',
          {
            ...tooltip(
              'Your donation is very much appreciated and will\nbe used for further development of AdaLite',
              true
            ),
          },
          h('span', {class: 'show-info'}, '')
        )
      ),
      !isDonationSufficient &&
        h('div', {class: 'send-donate-msg'}, 'Insufficient balance for a donation.'),
      !showCustomDonationInput && isDonationSufficient && h(DonationButtons, {isSendAddressValid}),
      showCustomDonationInput &&
        isDonationSufficient &&
        h(CustomDonationInput, {isSendAddressValid}),
      h('div', {class: 'ada-label'}, 'Fee'),
      h('div', {class: 'send-fee'}, printAda(transactionFee))
    ),
    h(
      'div',
      {
        class: 'send-total',
      },
      h(
        'div',
        {
          class: 'send-total-title',
        },
        'Total'
      ),
      h(
        'div',
        {class: 'send-total-inner'},
        h(
          'div',
          {
            class: 'send-total-ada',
          },
          printAda(total)
        ),
        conversionRates && h(Conversions, {balance: total, conversionRates})
      )
    ),
    h(
      'div',
      {class: 'validation-row'},
      h(
        'button',
        {
          class: 'button primary',
          disabled: !enableSubmit || feeRecalculating,
          onClick: confirmTransaction,
          ref: (element) => {
            this.submitTxBtn = element
          },
        },
        'Send ADA'
      ),
      feeRecalculating
        ? h(CalculatingFee)
        : h(SendValidation, {
          sendFormValidationError,
          sendResponse,
        })
    ),
    enableSubmit &&
      !feeRecalculating &&
      h(
        'a',
        {
          href: '#',
          class: 'send-raw',
          onClick: enableSubmit && !feeRecalculating && rawTransactionHandler,
        },
        'Raw unsigned transaction'
      ),
    showTransactionErrorModal &&
      h(TransactionErrorModal, {
        closeHandler: closeTransactionErrorModal,
        errorMessage: getTranslation(
          transactionSubmissionError.code,
          transactionSubmissionError.params
        ),
        showHelp: errorHasHelp(transactionSubmissionError.code),
      }),
    rawTransactionOpen && h(RawTransactionModal),
    showConfirmTransactionDialog && h(ConfirmTransactionDialog, {total}),
    showThanksForDonation && h(DonateThanksModal, {closeThanksForDonationModal})
  )
}

export default connect(
  (state) => ({
    transactionSubmissionError: state.transactionSubmissionError,
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddressValidationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmountValidationError,
    sendAmount: state.sendAmount.fieldValue,
    sendAmountForTransactionFee: state.sendAmountForTransactionFee,
    donationAmountValidationError: state.donationAmountValidationError,
    donationAmountForTransactionFee: state.donationAmountForTransactionFee,
    transactionFee: state.transactionFee,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    showTransactionErrorModal: state.showTransactionErrorModal,
    feeRecalculating: state.calculatingFee,
    showThanksForDonation: state.showThanksForDonation,
    rawTransaction: state.rawTransaction,
    rawTransactionOpen: state.rawTransactionOpen,
    coinsAmount: state.sendAmount.coins,
    showCustomDonationInput: state.showCustomDonationInput,
    maxDonationAmount: state.maxDonationAmount,
    conversionRates: state.conversionRates && state.conversionRates.data,
  }),
  actions
)(SendAdaPage)
