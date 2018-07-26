const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const {getTranslation} = require('../../../translations')
const printAda = require('../../../helpers/printAda')

const ConfirmTransactionDialog = require('./confirmTransactionDialog')

class SendAdaPage extends Component {
  render({
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
    sendAllFunds,
    totalAmount,
  }) {
    const enableSubmit =
      sendAmount && !sendAmountValidationError && sendAddress && !sendAddressValidationError

    const enableSendAllFunds = isSendAddressValid

    const displayTransactionFee =
      sendAmount !== '' &&
      transactionFee > 0 &&
      !feeRecalculating &&
      (!sendAmountValidationError ||
        sendAmountValidationError.code === 'SendAmountInsufficientFunds')

    return h(
      'div',
      {class: 'content-wrapper'},
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
              class: `send-all-funds-btn send-all-funds-btn-${
                enableSendAllFunds ? 'enabled' : 'disabled'
              }`,
              onClick: sendAllFunds,
            },
            'Send all'
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
              {disabled: true, class: 'loading-button'},
              h('div', {class: 'loading-inside-button'}),
              'Calculating Fee'
            )
            : h(
              'button',
              {
                disabled: !enableSubmit,
                onClick: confirmTransaction,
                class: 'loading-button',
              },
              'Submit'
            )
        ),
        showConfirmTransactionDialog && h(ConfirmTransactionDialog)
      )
    )
  }
}

module.exports = connect(
  (state) => ({
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
  }),
  actions
)(SendAdaPage)
