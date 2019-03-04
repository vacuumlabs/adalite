const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')

class RawTransactionModal {
  render({rawTransaction, setRawTransactionOpen}) {
    return h(
      Modal,
      {
        closeHandler: () => setRawTransactionOpen(false),
        bodyClass: 'width-auto',
      },
      h(
        'div',
        {class: 'width-auto'},
        h('h4', undefined, 'Raw unsigned transaction'),
        h('div', {class: 'raw-transaction one-click-select'}, rawTransaction)
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    rawTransaction: state.rawTransaction,
  }),
  actions
)(RawTransactionModal)
