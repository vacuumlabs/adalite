import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import SendAdaPage from '../sendAda/sendAdaPage'

interface Props {
  closeSendTransactionModal: any
  title: string
}

const SendTransactionModal = ({closeSendTransactionModal, title}: Props) => (
  <Modal onRequestClose={closeSendTransactionModal} bodyClass="send">
    <SendAdaPage showDonationFields={false} isModal title={title} />
  </Modal>
)

export default connect(
  (state) => ({
    title: state.sendTransactionTitle,
  }),
  actions
)(SendTransactionModal)
