import ErrorModal from '../../common/errorModal'

const TransactionErrorModal = ({closeHandler, errorMessage, showHelp}) =>
  ErrorModal({
    closeHandler,
    errorMessage,
    title: 'Transaction error',
    buttonTitle: 'OK',
    showHelp,
  })

export default TransactionErrorModal
