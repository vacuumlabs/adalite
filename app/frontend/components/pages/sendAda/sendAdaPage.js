const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const {getTranslation} = require('../../../translations')
const printAda = require('../../../helpers/printAda')

const ConfirmTransactionDialog = require('./confirmTransactionDialog')
const RawTransactionModal = require('./rawTransactionModal')
const DonateThanksModal = require('./donateThanksModal')

const CalculatingFee = () => h('div', {class: 'validation-message send'}, 'Calculating fee')

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
    : sendResponse &&
      h(
        'div',
        {class: `validation-message send ${sendResponse.success ? 'success' : 'error'}`},
        sendResponse.success ? 'Transaction successful' : 'Transaction failed'
      )

const SendAdaPage = ({
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
  getRawTransaction,
  rawTransactionOpen,
  setRawTransactionOpen,
  rawTransaction,
}) => {
  const enableSubmit =
    sendAmount && !sendAmountValidationError && sendAddress && !sendAddressValidationError

  const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''

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
        'div',
        undefined,
        h(
          'label',
          {
            class: 'send-label',
            for: 'send-amount',
          },
          'Amount'
        )
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
          },
          'Max'
        )
      ),
      h(
        'div',
        undefined,
        h(
          'div',
          {
            class: 'send-label',
          },
          'Fee'
        )
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
          disabled: !enableSubmit,
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
        })
    ),
    rawTransactionOpen && h(RawTransactionModal),
    showConfirmTransactionDialog && h(ConfirmTransactionDialog),
    showThanksForDonation && h(DonateThanksModal, {closeThanksForDonationModal})
  )
}

module.exports = connect(
  (state) => ({
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddress.validationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmount.validationError,
    sendAmount: state.sendAmount.fieldValue,
    transactionFee: state.transactionFee,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    feeRecalculating: state.calculatingFee,
    showThanksForDonation: state.showThanksForDonation,
    rawTransaction: state.rawTransaction,
    rawTransactionOpen: state.rawTransactionOpen,
  }),
  actions
)(SendAdaPage)
