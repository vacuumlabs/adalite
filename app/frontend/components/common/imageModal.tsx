import {h, Component} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import Modal from './modal'

interface Props {
  closeModal: () => void
}

class ImageModal extends Component<Props, {}> {
  render({closeModal}) {
    return (
      <Modal onRequestClose={closeModal}>
        <img
          style={'width: 100%; height: 100%;'}
          src="/delegationCycle.png"
          alt="Delegation cycle"
        />
      </Modal>
    )
  }
}

export default connect(
  (state) => ({
    displayInfoModal: state.displayInfoModal,
  }),
  actions
)(ImageModal)
