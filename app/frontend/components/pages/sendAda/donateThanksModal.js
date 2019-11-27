import {h} from 'preact'

import Modal from '../../common/modal'

const DonateThanksModal = ({closeThanksForDonationModal}) =>
  h(
    Modal,
    {
      closeHandler: closeThanksForDonationModal,
      title: 'Thank you!',
      bodyClass: 'centered',
    },
    h(
      'p',
      {class: 'modal-paragraph'},
      'Thank you for your donation which has allowed us to sustain our efforts in making a difference in the Cardano community. We appreciate your kindness.'
    ),
    h(
      'div',
      {class: 'modal-footer'},
      h(
        'button',
        {
          class: 'button primary',
          onClick: closeThanksForDonationModal,
        },
        "You're welcome"
      )
    )
  )

export default DonateThanksModal
