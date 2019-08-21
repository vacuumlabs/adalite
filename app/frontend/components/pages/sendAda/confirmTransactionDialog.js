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
    donationAmount,
    total,
  }) {
    return h(
      Modal,
      {
        closeHandler: cancelTransaction,
        title: 'Transaction review',
      },
      h(
        'div',
        {class: 'review'},
        h('div', {class: 'review-label'}, 'Address'),
        h('div', {class: 'review-address'}, sendAddress),
        h('div', {class: 'ada-label'}, 'Amount'),
        h('div', {class: 'review-amount'}, printAda(sendAmount)),
        h('div', {class: 'ada-label'}, 'Donation'),
        h('div', {class: 'review-amount'}, printAda(donationAmount)),
        h('div', {class: 'ada-label'}, 'Fee'),
        h('div', {class: 'review-fee'}, printAda(transactionFee)),
        h('div', {class: 'ada-label'}, 'Total'),
        h('div', {class: 'review-total'}, printAda(total))
      ),
      h(
        'div',
        {class: 'review-bottom'},
        h(
          'button',
          {
            class: 'button primary',
            onClick: submitTransaction,
          },
          'Confirm Transaction'
        ),
        h(
          'a',
          {
            class: 'review-cancel',
            onClick: cancelTransaction,
            ref: (element) => {
              this.cancelTx = element
            },
            onKeyDown: (e) => {
              e.key === 'Enter' && e.target.click()
            },
          },
          'Cancel Transaction'
        )
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    sendAmount: state.sendAmountForTransactionFee,
    transactionFee: state.transactionFee,
    donationAmount: state.donationAmountForTransactionFee,
  }),
  actions
)(ConfirmTransactionDialogClass)
