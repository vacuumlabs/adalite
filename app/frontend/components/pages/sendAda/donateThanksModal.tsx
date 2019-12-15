import {h} from 'preact'

import Modal from '../../common/modal'

const DonateThanksModal = ({closeThanksForDonationModal}) => (
  <Modal closeHandler={closeThanksForDonationModal} title="Thank you!" bodyClass="centered">
    <p className="modal-paragraph">
      Thank you for your donation which has allowed us to sustain our efforts in making a difference
      in the Cardano community. We appreciate your kindness.
    </p>
    <div className="modal-footer">
      <button className="button primary" onClick={closeThanksForDonationModal}>
        You're welcome
      </button>
    </div>
  </Modal>
)

export default DonateThanksModal
