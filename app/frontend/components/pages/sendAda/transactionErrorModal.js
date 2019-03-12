const ErrorModal = require('../../common/errorModal')

const TransactionErrorModal = ({closeHandler, errorMessage}) =>
  ErrorModal({
    closeHandler,
    errorMessage,
    title: 'Transaction error',
    buttonTitle: 'OK',
  })

module.exports = TransactionErrorModal
