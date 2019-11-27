import {h} from 'preact'
import {connect} from 'unistore/preact'
import actions from '../../../actions'
import Modal from '../../common/modal'

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

export default connect(
  (state) => ({
    rawTransaction: state.rawTransaction,
  }),
  actions
)(RawTransactionModal)
