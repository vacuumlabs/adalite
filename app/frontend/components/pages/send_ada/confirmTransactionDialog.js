const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const printAda = require('../../../helpers/printAda')

const ConfirmTransactionDialog = connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    sendAmount: state.sendAmountForTransactionFee,
    transactionFee: state.transactionFee,
  }),
  actions
)(({sendAddress, sendAmount, transactionFee, submitTransaction, cancelTransaction}) => {
  const total = sendAmount + transactionFee
  return h(
    'div',
    {class: 'overlay'},
    h(
      'div',
      {class: 'box'},
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
          {class: ''},
          h('button', {onClick: submitTransaction}, 'Confirm'),
          h('button', {class: 'cancel', onClick: cancelTransaction}, 'Cancel')
        )
      )
    )
  )
})

module.exports = ConfirmTransactionDialog
