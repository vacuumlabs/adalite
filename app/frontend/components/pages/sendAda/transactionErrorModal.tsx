import ErrorModal from '../../common/errorModal'

const TransactionErrorModal = ({onRequestClose, errorMessage, showHelp}) =>
  ErrorModal({
    onRequestClose,
    errorMessage,
    title: 'Transaction error',
    buttonTitle: 'OK',
    showHelp,
  })

export default TransactionErrorModal
