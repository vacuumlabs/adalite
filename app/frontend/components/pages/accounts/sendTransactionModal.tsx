import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import SendAdaPage from '../sendAda/sendAdaPage'

interface Props {
  closeSendTransactionModal: any
}

const SendTransactionModal = ({closeSendTransactionModal}: Props) => (
  <Modal onRequestClose={closeSendTransactionModal} bodyClass="send">
    <SendAdaPage showDonationFields={false} isModal title={'Transfer funds between accounts'} />
  </Modal>
)

export default connect(null, actions)(SendTransactionModal)
