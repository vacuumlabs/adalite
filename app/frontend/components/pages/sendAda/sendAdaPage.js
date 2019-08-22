const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const {getTranslation} = require('../../../translations')
const printAda = require('../../../helpers/printAda')

const ConfirmTransactionDialog = require('./confirmTransactionDialog')
const RawTransactionModal = require('./rawTransactionModal')
const DonateThanksModal = require('./donateThanksModal')
const TransactionErrorModal = require('./transactionErrorModal')
const DonationRadioButtons = require('./donationRadioButtons')
const CustomDonationInput = require('./customDonationInput')
const Conversions = require('../../common/conversions')

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

const DonationErrorMessage = ({donationAmountValidationError}) =>
  donationAmountValidationError &&
  h('span', undefined, getTranslation(donationAmountValidationError.code))

const SendValidation = ({
  sendAmount,
  sendAmountValidationError,
  sendAddress,
  sendAddressValidationError,
  sendResponse,
  donationAmountValidationError,
}) =>
  sendAmountValidationError || sendAddressValidationError || donationAmountValidationError
    ? h(
      'div',
      {class: 'validation-message send error'},
      h(AddressErrorMessage, {sendAddress, sendAddressValidationError}),
      h(AmountErrorMessage, {sendAmount, sendAmountValidationError}),
      h(DonationErrorMessage, {donationAmountValidationError})
    )
    : sendResponse.success &&
      h('div', {class: 'validation-message transaction-success'}, 'Transaction successful!')

const SendAdaPage = ({
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
  setRawTransactionOpen,
  rawTransaction,
  coinsAmount,
  showCustomDonationInput,
  maxAmount,
  conversionRates,
  donationAmount,
}) => {
  const enableSubmit =
    sendAmount &&
    !sendAmountValidationError &&
    sendAddress &&
    !sendAddressValidationError &&
    !donationAmountValidationError

  const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''
  const total = sendAmountForTransactionFee + transactionFee + donationAmount

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
        'label',
        {
          class: 'ada-label amount',
          for: 'donation-amount',
        },
        'Donate'
      ),
      sendAmount >= maxAmount && h('div', {}, 'Insufficient balance for a donation.'),
      !showCustomDonationInput &&
        sendAmount < maxAmount &&
        h(DonationRadioButtons, {isSendAddressValid}),
      showCustomDonationInput &&
        sendAmount < maxAmount &&
        h(CustomDonationInput, {isSendAddressValid}),
      h('div', {class: 'ada-label'}, 'Fee'),
      h('div', {class: 'send-fee'}, printAda(transactionFee))
    ),
    h(
      'div',
      {
        class: 'total-row',
      },
      h('div', {}, 'Total'),
      h('div', {}, printAda(total)),
      h('div', {}, 'xxxx'),
      conversionRates && h(Conversions, {balance: total, conversionRates}) //TODO: tidy
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
          donationAmountValidationError,
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
        errorMessage: getTranslation(sendResponse.error, {sendResponse}),
      }),
    rawTransactionOpen && h(RawTransactionModal),
    showConfirmTransactionDialog && h(ConfirmTransactionDialog, {total}),
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
    sendAmountForTransactionFee: state.sendAmountForTransactionFee,
    donationAmountValidationError: state.donationAmount.validationError,
    donationAmount: state.donationAmountForTransactionFee,
    transactionFee: state.transactionFee,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    showTransactionErrorModal: state.showTransactionErrorModal,
    feeRecalculating: state.calculatingFee,
    showThanksForDonation: state.showThanksForDonation,
    rawTransaction: state.rawTransaction,
    rawTransactionOpen: state.rawTransactionOpen,
    coinsAmount: state.sendAmount.coins,
    showCustomDonationInput: state.showCustomDonationInput,
    maxAmount: state.maxAmount,
    conversionRates: state.conversionRates && state.conversionRates.data,
  }),
  actions
)(SendAdaPage)
