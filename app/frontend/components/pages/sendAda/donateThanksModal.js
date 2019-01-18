const {h} = require('preact')

const Modal = require('../../common/modal')

const DonateThanksModal = ({closeThanksForDonationModal}) =>
  h(
    Modal,
    {
      closeHanlder: closeThanksForDonationModal,
    },
    h(
      'div',
      {
        class: 'centered-row',
      },
      h('h3', undefined, 'Thank you for supporting AdaLite developers!')
    ),
    h(
      'div',
      {class: 'centered-row margin-top'},
      h(
        'button',
        {
          onClick: closeThanksForDonationModal,
        },
        'OK'
      )
    )
  )

module.exports = DonateThanksModal
