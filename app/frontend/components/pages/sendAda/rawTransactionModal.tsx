import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'

class RawTransactionModal {
  render({rawTransaction, setRawTransactionOpen}) {
    return (
      <Modal closeHandler={() => setRawTransactionOpen(false)} bodyClass="width-auto">
        <div className="width-auto">
          <h4>Raw unsigned transaction</h4>
          <div className="raw-transaction one-click-select">{rawTransaction}</div>
        </div>
      </Modal>
    )
  }
}

export default connect(
  (state) => ({
    rawTransaction: state.rawTransaction,
  }),
  actions
)(RawTransactionModal)
