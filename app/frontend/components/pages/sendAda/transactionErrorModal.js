const {h} = require('preact')

const Modal = require('../../common/modal')
const Alert = require('../../common/alert')

const TransactionErrorModal = ({closeTransactionErrorModal, errorMessage}) =>
  h(
    Modal,
    {
      closeHandler: closeTransactionErrorModal,
      title: 'Transaction error',
    },
    h(
      Alert,
      {
        alertType: 'error',
      },
      errorMessage
    ),
    h(
      'div',
      {class: 'modal-footer'},
      h(
        'button',
        {
          class: 'button primary',
          onClick: closeTransactionErrorModal,
        },
        'I understand, continue to the demo wallet'
      )
    )
  )

module.exports = TransactionErrorModal
