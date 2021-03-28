import {h} from 'preact'
import {useActions, useSelector} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import DelegatePage from '../delegations/delegatePage'
import {formatAccountIndex} from '../../../helpers/formatAccountIndex'

const DelegationModal = () => {
  const sourceAccountIndex = useSelector((state) => state.sourceAccountIndex)
  const {closeDelegationModal} = useActions(actions)
  return (
    <Modal onRequestClose={closeDelegationModal} bodyClass="delegate">
      <DelegatePage
        withAccordion={false}
        title={`Delegate Account ${formatAccountIndex(sourceAccountIndex)} Stake`}
      />
    </Modal>
  )
}

export default DelegationModal
