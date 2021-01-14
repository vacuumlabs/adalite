import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import DelegatePage from '../delegations/delegatePage'

interface Props {
  closeDelegationModal: any
  title: string
}

const DelegationModal = ({closeDelegationModal, title}: Props) => (
  <Modal onRequestClose={closeDelegationModal} bodyClass="delegate">
    <DelegatePage withAccordion={false} title={title} />
  </Modal>
)

export default connect(
  (state) => ({
    title: state.delegationTitle,
  }),
  actions
)(DelegationModal)
