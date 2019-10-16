const ErrorModal = require('../../common/errorModal')

const WalletLoadingErrorModal = ({closeHandler, errorMessage, showHelp}) =>
  ErrorModal({
    closeHandler,
    errorMessage,
    title: 'Error loading wallet',
    buttonTitle: 'OK',
    showHelp,
  })

module.exports = WalletLoadingErrorModal
