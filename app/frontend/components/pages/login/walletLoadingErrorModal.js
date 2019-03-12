const ErrorModal = require('../../common/errorModal')

const WalletLoadingErrorModal = ({closeHandler, errorMessage}) =>
  ErrorModal({
    closeHandler,
    errorMessage,
    title: 'Error loading wallet',
    buttonTitle: 'OK',
  })

module.exports = WalletLoadingErrorModal
