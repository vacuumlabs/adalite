import ErrorModal from '../../common/errorModal'

const TransactionErrorModal = ({onRequestClose, errorMessage, helpType}) =>
  ErrorModal({
    onRequestClose,
    errorMessage,
    title: 'Transaction error',
    buttonTitle: 'OK',
    helpType,
  })

export default TransactionErrorModal
