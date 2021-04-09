import {h} from 'preact'
import {useSelector, useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import {State} from '../../../state'

const RawTransactionModal = (): h.JSX.Element => {
  const {rawTransaction} = useSelector((state: State) => ({
    rawTransaction: state.rawTransaction,
  }))
  const {setRawTransactionOpen} = useActions(actions)
  return (
    <Modal onRequestClose={() => setRawTransactionOpen(false)} bodyClass="width-auto">
      <div className="width-auto">
        <h4>Raw unsigned transaction</h4>
        <div className="raw-transaction one-click-select">{rawTransaction}</div>
      </div>
    </Modal>
  )
}

export default RawTransactionModal
