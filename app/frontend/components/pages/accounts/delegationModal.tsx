import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import DelegatePage from '../delegations/delegatePage'
import {printAccountIndex} from '../../../helpers/printAccountIndex'

interface Props {
  closeDelegationModal: any
  sourceAccountIndex: number
}

const DelegationModal = ({closeDelegationModal, sourceAccountIndex}: Props) => (
  <Modal onRequestClose={closeDelegationModal} bodyClass="delegate">
    <DelegatePage
      withAccordion={false}
      title={`Delegate Account ${printAccountIndex(sourceAccountIndex)} Stake`}
    />
  </Modal>
)

export default connect(
  (state) => ({
    sourceAccountIndex: state.sourceAccountIndex,
  }),
  actions
)(DelegationModal)
