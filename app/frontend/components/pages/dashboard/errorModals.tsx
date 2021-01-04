import actions from '../../../actions'
import {errorHasHelp} from '../../../helpers/errorsWithHelp'
import {connect} from '../../../libs/unistore/preact'
import {State} from '../../../state'
import {getTranslation} from '../../../translations'
import {Fragment, h} from 'preact'
import TransactionErrorModal from '../sendAda/transactionErrorModal'
import WalletLoadingErrorModal from '../login/walletLoadingErrorModal'

const ErrorModals = ({
  shouldShowTransactionErrorModal,
  transactionSubmissionError,
  closeTransactionErrorModal,
  shouldShowWalletLoadingErrorModal,
  walletLoadingError,
  closeWalletLoadingErrorModal,
}) => {
  return (
    <Fragment>
      {shouldShowTransactionErrorModal && (
        <TransactionErrorModal
          onRequestClose={closeTransactionErrorModal}
          errorMessage={getTranslation(
            transactionSubmissionError.code,
            transactionSubmissionError.params
          )}
          showHelp={errorHasHelp(transactionSubmissionError.code)}
        />
      )}
      {shouldShowWalletLoadingErrorModal && (
        <WalletLoadingErrorModal
          onRequestClose={closeWalletLoadingErrorModal}
          errorMessage={getTranslation(walletLoadingError.code, walletLoadingError.params)}
          showHelp={errorHasHelp(walletLoadingError.code)}
        />
      )}
    </Fragment>
  )
}

export default connect(
  (state: State) => ({
    shouldShowTransactionErrorModal: state.shouldShowTransactionErrorModal,
    transactionSubmissionError: state.transactionSubmissionError,
    shouldShowWalletLoadingErrorModal: state.shouldShowWalletLoadingErrorModal,
    walletLoadingError: state.walletLoadingError,
  }),
  actions
)(ErrorModals)
