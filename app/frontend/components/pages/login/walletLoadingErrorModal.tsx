import ErrorModal from '../../common/errorModal'

interface Props {
  closeHandler: () => void
  errorMessage: string
  showHelp?: boolean
}

const WalletLoadingErrorModal = ({closeHandler, errorMessage, showHelp}: Props) =>
  ErrorModal({
    closeHandler,
    errorMessage,
    title: 'Error loading wallet',
    buttonTitle: 'OK',
    showHelp,
  })

export default WalletLoadingErrorModal
