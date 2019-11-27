import ErrorModal from '../../common/errorModal'

const WalletLoadingErrorModal = ({closeHandler, errorMessage, showHelp}) =>
  ErrorModal({
    closeHandler,
    errorMessage,
    title: 'Error loading wallet',
    buttonTitle: 'OK',
    showHelp,
  })

export default WalletLoadingErrorModal
