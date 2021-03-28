import {h} from 'preact'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import SendAdaPage from '../sendAda/sendAdaPage'

const SendTransactionModal = () => {
  const {closeSendTransactionModal} = useActions(actions)
  return (
    <Modal onRequestClose={closeSendTransactionModal} bodyClass="send">
      <SendAdaPage isModal title={'Transfer funds between accounts'} />
    </Modal>
  )
}

export default SendTransactionModal
