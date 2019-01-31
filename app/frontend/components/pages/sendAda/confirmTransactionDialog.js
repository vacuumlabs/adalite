const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const printAda = require('../../../helpers/printAda')
const Modal = require('../../common/modal')

class ConfirmTransactionDialogClass {
  componentDidMount() {
    this.cancelTx.focus()
  }

  render({
    sendAddress,
    sendAmount,
    transactionFee,
    submitTransaction,
    cancelTransaction,
    waitingForHwWallet,
    usingHwWallet,
  }) {
    const total = sendAmount + transactionFee
    return h(
      Modal,
      {
        closeHandler: cancelTransaction,
        bodyClass: 'width-auto',
      },
      h(
        'div',
        {class: 'width-auto'},
        h('h4', undefined, 'Review transaction'),
        h(
          'div',
          {class: 'review-transaction-container'},
          h('div', {class: 'review-transaction-row'}, h('span', undefined, 'Adress: ')),
          h(
            'div',
            {class: 'review-transaction-row'},
            h('span', {class: 'full-address'}, sendAddress)
          ),
          h(
            'div',
            {class: 'review-transaction-row'},
            'Amout: ',
            h('b', undefined, printAda(sendAmount))
          ),
          h(
            'div',
            {class: 'review-transaction-row'},
            'Transaction fee: ',
            h('b', undefined, printAda(transactionFee))
          ),
          h(
            'div',
            {class: 'review-transaction-total-row'},
            h('b', {class: 'review-transaction-total-label'}, 'TOTAL (ADA)'),
            h('b', {class: 'review-transaction-total'}, printAda(total))
          ),
          h(
            'div',
            {class: 'flex-align'},
            h(
              'button',
              {
                class: `${usingHwWallet && waitingForHwWallet ? 'waiting-for-hw-wallet-button' : ''}`,
                onClick: submitTransaction,
                ref: (element) => {
                  this.confirmTx = element
                },
                onKeyDown: (e) => {
                  e.key === 'Enter' && e.target.click()
                  if (['Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    this.cancelTx.focus()
                    e.preventDefault()
                  }
                },
              },
              h('div', {
                class: `${usingHwWallet && waitingForHwWallet ? 'loading-inside-button' : ''}`,
              }),
              usingHwWallet && waitingForHwWallet ? 'Waiting' : 'Confirm'
            ),
            h(
              'button',
              {
                class: 'cancel',
                onClick: cancelTransaction,
                ref: (element) => {
                  this.cancelTx = element
                },
                onKeyDown: (e) => {
                  e.key === 'Enter' && e.target.click()
                  if (['Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    this.confirmTx.focus()
                    e.preventDefault()
                  }
                },
              },
              'Cancel'
            )
          )
        )
      ),
      usingHwWallet &&
        waitingForHwWallet &&
        h('div', {class: 'transparent-overlay', onClick: (e) => e.stopPropagation()})
    )
  }
}

module.exports = connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    sendAmount: state.sendAmountForTransactionFee,
    transactionFee: state.transactionFee,
    waitingForHwWallet: state.waitingForHwWallet,
    usingHwWallet: state.usingHwWallet,
  }),
  actions
)(ConfirmTransactionDialogClass)
