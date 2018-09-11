const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const {getTranslation} = require('../../../translations')
const printAda = require('../../../helpers/printAda')

const Balance = require('../../common/balance')
const ConfirmTransactionDialog = require('./confirmTransactionDialog')
const {CloseIcon} = require('../../common/svg')

class ThanksForDonationModal extends Component {
  componentDidMount() {
    this.thanksForDonationBtn.focus()
  }

  render({closeThanksForDonationModal}) {
    return h(
      'div',
      {
        class: 'overlay fade-in-up',
        onKeyDown: (e) => e.key === 'Escape' && closeThanksForDonationModal(),
      },
      h('div', {
        class: 'overlay-close-layer',
        onClick: closeThanksForDonationModal,
      }),
      h(
        'div',
        {class: 'box'},
        h(
          'span',
          {
            class: 'overlay-close-button',
            onClick: closeThanksForDonationModal,
          },
          h(CloseIcon)
        ),
        h(
          'div',
          {
            class: 'centered-row',
          },
          h('h3', undefined, 'Thank you for supporting CardanoLite developers!')
        ),
        h(
          'div',
          {class: 'centered-row margin-top'},
          h(
            'button',
            {
              ref: (element) => {
                this.thanksForDonationBtn = element
              },
              onClick: closeThanksForDonationModal,
              onKeyDown: (e) => e.key === 'Enter' && e.target.click(),
            },
            'OK'
          )
        )
      )
    )
  }
}

class SendAdaPage extends Component {
  componentDidMount() {
    this.addressField.focus()
  }

  render({
    balance,
    reloadWalletInfo,
    sendResponse,
    sendAddress,
    sendAddressValidationError,
    isSendAddressValid,
    sendAmount,
    sendAmountValidationError,
    updateAddress,
    updateAmount,
    transactionFee,
    confirmTransaction,
    showConfirmTransactionDialog,
    feeRecalculating,
    sendMaxFunds,
    totalAmount,
    showThanksForDonation,
    closeThanksForDonationModal,
  }) {
    const enableSubmit =
      sendAmount && !sendAmountValidationError && sendAddress && !sendAddressValidationError

    const displayTransactionFee =
      sendAmount !== '' &&
      transactionFee > 0 &&
      !feeRecalculating &&
      (!sendAmountValidationError ||
        sendAmountValidationError.code === 'SendAmountInsufficientFunds')

    return h(
      'div',
      {class: 'content-wrapper'},
      h(Balance, {balance, reloadWalletInfo}),
      h(
        'div',
        undefined,
        h('h2', undefined, 'Send Ada'),
        sendResponse !== ''
          ? h(
            'div',
            {
              id: 'transacton-submitted',
              class: `alert ${sendResponse.success ? 'success' : 'error'}`,
            },
            'Transaction ',
            sendResponse.success
              ? h('b', undefined, 'successful')
              : h(
                'span',
                undefined,
                h('b', undefined, 'failed'),
                `: ${getTranslation(sendResponse.error, {sendResponse})}`
              )
          )
          : '',
        h(
          'div',
          {class: 'row'},
          h('label', undefined, h('span', undefined, 'Receiving address')),
          sendAddressValidationError &&
            h('span', {class: 'validationMsg'}, getTranslation(sendAddressValidationError.code))
        ),
        h('input', {
          type: 'text',
          id: 'send-address',
          class: 'styled-input-nodiv styled-send-input',
          name: 'send-address',
          placeholder: 'Address',
          size: '28',
          value: sendAddress,
          onInput: updateAddress,
          autocomplete: 'nope',
          ref: (element) => {
            this.addressField = element
          },
          onKeyDown: (e) => e.key === 'Enter' && this.amountField.focus(),
        }),
        h(
          'div',
          {class: 'amount-label-row'},
          h('div', {class: 'row'}, h('label', undefined, h('span', undefined, 'Amount'))),
          displayTransactionFee &&
            h('span', {class: 'transaction-fee'}, `+ ${printAda(transactionFee)} tx fee`)
        ),
        h(
          'div',
          {
            class: 'send-amount-input-group',
          },
          h(
            'div',
            {
              class: `send-max-funds-btn send-max-funds-btn-${
                isSendAddressValid ? 'enabled' : 'disabled'
              }`,
              onClick: sendMaxFunds,
            },
            'MAX'
          ),
          h(
            'div',
            {class: 'styled-input send-input'},
            h('input', {
              id: 'send-amount',
              name: 'send-amount',
              placeholder: 'Amount',
              size: '28',
              value: sendAmount,
              onInput: updateAmount,
              autocomplete: 'nope',
              ref: (element) => {
                this.amountField = element
              },
              onKeyDown: (e) => {
                if (e.key === 'Tab') {
                  enableSubmit && this.submitTxBtn
                    ? this.submitTxBtn.focus()
                    : this.addressField.focus()
                  e.preventDefault()
                }
                if (e.key === 'Enter' && this.submitTxBtn) {
                  this.submitTxBtn.click()
                  e.preventDefault()
                }
              },
            }),
            displayTransactionFee &&
              h(
                'span',
                {
                  class: `transaction-fee-text ${
                    feeRecalculating || !enableSubmit ? 'red' : 'green'
                  }`,
                },
                `= ${printAda(totalAmount)} ADA`
              )
          )
        ),
        sendAmountValidationError &&
          h(
            'p',
            {class: 'validationMsg send-amount-validation-error'},
            getTranslation(sendAmountValidationError.code, sendAmountValidationError.params)
          ),
        h(
          'div',
          undefined,
          feeRecalculating
            ? h(
              'button',
              {disabled: true, class: 'submit-button'},
              h('div', {class: 'loading-inside-button'}),
              'Calculating Fee'
            )
            : h(
              'button',
              {
                class: 'submit-button',
                disabled: !enableSubmit,
                onClick: confirmTransaction,
                onKeyDown: (e) => {
                  if (e.key === 'Tab') {
                    this.addressField.focus()
                    e.preventDefault()
                  }
                },
                ref: (element) => {
                  this.submitTxBtn = element
                },
              },
              'Submit'
            )
        ),
        showConfirmTransactionDialog && h(ConfirmTransactionDialog),
        showThanksForDonation && h(ThanksForDonationModal, {closeThanksForDonationModal})
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    balance: state.balance,
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddress.validationError,
    sendAddress: state.sendAddress.fieldValue,
    isSendAddressValid: state.isSendAddressValid,
    sendAmountValidationError: state.sendAmount.validationError,
    sendAmount: state.sendAmount.fieldValue,
    transactionFee: state.transactionFee,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    feeRecalculating: state.calculatingFee,
    totalAmount: state.sendAmountForTransactionFee + state.transactionFee,
    showThanksForDonation: state.showThanksForDonation,
  }),
  actions
)(SendAdaPage)
