import ErrorModal from '../../common/errorModal'

interface Props {
  onRequestClose: () => void
  errorMessage: string
  showHelp?: boolean
}

const WalletLoadingErrorModal = ({onRequestClose, errorMessage, showHelp}: Props) =>
  ErrorModal({
    onRequestClose,
    errorMessage,
    title: 'Error loading wallet',
    buttonTitle: 'OK',
    showHelp,
  })

export default WalletLoadingErrorModal
