const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const {getTranslation} = require('../../../translations')
const printAda = require('../../../helpers/printAda')

const ConfirmTransactionDialog = require('./confirmTransactionDialog')
const RawTransactionModal = require('./rawTransactionModal')
const DonateThanksModal = require('./donateThanksModal')
const TransactionErrorModal = require('./transactionErrorModal')

const CalculatingFee = () => h('div', {class: 'validation-message send'}, 'Calculating fee...')

const AmountErrorMessage = ({sendAmount, sendAmountValidationError}) =>
  sendAmountValidationError &&
  h(
    'span',
    undefined,
    sendAmountValidationError.code === 'SendAmountCantSendMaxFunds'
      ? getTranslation(sendAmountValidationError.code, sendAmountValidationError.params)
      : sendAmount !== '' &&
        getTranslation(sendAmountValidationError.code, sendAmountValidationError.params)
  )

const AddressErrorMessage = ({sendAddress, sendAddressValidationError}) =>
  sendAddressValidationError &&
  sendAddress !== '' &&
  h('span', undefined, getTranslation(sendAddressValidationError.code))

const SendValidation = ({
  sendAmount,
  sendAmountValidationError,
  sendAddress,
  sendAddressValidationError,
  sendResponse,
}) =>
  sendAmountValidationError || sendAddressValidationError
    ? h(
      'div',
      {class: 'validation-message send error'},
      h(AddressErrorMessage, {sendAddress, sendAddressValidationError}),
      h(AmountErrorMessage, {sendAmount, sendAmountValidationError})
    )
    : sendResponse.success &&
      h('div', {class: 'validation-message transaction-success'}, 'Transaction successful!')

const SendAdaPage = ({
  transactionSubmissionError,
  sendResponse,
  sendAddress,
  sendAddressValidationError,
  sendAmount,
  sendAmountValidationError,
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
  setRawTransactionOpen,
  rawTransaction,
  coinsAmount,
}) => {
  const enableSubmit =
    sendAmount && !sendAmountValidationError && sendAddress && !sendAddressValidationError

  const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''

  const rawTransactionHandler = async () => {
    await getRawTransaction(sendAddress, coinsAmount)
    setRawTransactionOpen(true)
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
        'div',
        {
          class: 'ada-label',
        },
        'Fee'
      ),
      h('div', {class: 'send-fee'}, printAda(transactionFee))
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
          sendAmount,
          sendAmountValidationError,
          sendAddress,
          sendAddressValidationError,
          sendResponse,
          closeTransactionErrorModal,
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
        errorMessage: getTranslation(transactionSubmissionError.name, {transactionSubmissionError}),
      }),
    rawTransactionOpen && h(RawTransactionModal),
    showConfirmTransactionDialog && h(ConfirmTransactionDialog),
    showThanksForDonation && h(DonateThanksModal, {closeThanksForDonationModal})
  )
}

module.exports = connect(
  (state) => ({
    transactionSubmissionError: state.transactionSubmissionError,
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddress.validationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmount.validationError,
    sendAmount: state.sendAmount.fieldValue,
    transactionFee: state.transactionFee,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    showTransactionErrorModal: state.showTransactionErrorModal,
    feeRecalculating: state.calculatingFee,
    showThanksForDonation: state.showThanksForDonation,
    rawTransaction: state.rawTransaction,
    rawTransactionOpen: state.rawTransactionOpen,
    coinsAmount: state.sendAmount.coins,
  }),
  actions
)(SendAdaPage)
