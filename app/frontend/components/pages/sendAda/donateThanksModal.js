const {h} = require('preact')

const Modal = require('../../common/modal')

const DonateThanksModal = ({closeThanksForDonationModal}) =>
  h(
    Modal,
    {
      closeHandler: closeThanksForDonationModal,
      title: 'Thank you!',
      bodyClass: 'centered',
    },
    /* TODO: Change copy */
    h(
      'p',
      {class: 'modal-paragraph'},
      'Your support helps us in many ways. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi bibendum condimentum feugiat. Etiam vel vulputate lorem.'
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

module.exports = DonateThanksModal
