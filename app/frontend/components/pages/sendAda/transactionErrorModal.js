const ErrorModal = require('../../common/errorModal')

const TransactionErrorModal = ({closeHandler, errorMessage, showHelp}) =>
  ErrorModal({
    closeHandler,
    errorMessage,
    title: 'Transaction error',
    buttonTitle: 'OK',
    showHelp,
  })

module.exports = TransactionErrorModal
