import {ErrorHelpType} from '../../../types'
import ErrorModal from '../../common/errorModal'

interface Props {
  onRequestClose: () => void
  errorMessage: string
  helpType?: ErrorHelpType | null
}

const WalletLoadingErrorModal = ({onRequestClose, errorMessage, helpType}: Props) =>
  ErrorModal({
    onRequestClose,
    errorMessage,
    title: 'Error loading wallet',
    buttonTitle: 'OK',
    helpType,
  })

export default WalletLoadingErrorModal
