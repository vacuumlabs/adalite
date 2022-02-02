import actions from '../../../actions'
import {getErrorHelpType} from '../../../errors'
import {connect} from '../../../libs/unistore/preact'
import {State} from '../../../state'
import {getErrorMessage} from '../../../errors/errorMessages'
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
          errorMessage={getErrorMessage(
            transactionSubmissionError.code,
            transactionSubmissionError.params
          )}
          helpType={getErrorHelpType(transactionSubmissionError.code)}
        />
      )}
      {shouldShowWalletLoadingErrorModal && (
        <WalletLoadingErrorModal
          onRequestClose={closeWalletLoadingErrorModal}
          errorMessage={getErrorMessage(walletLoadingError.code, walletLoadingError.params)}
          helpType={getErrorHelpType(walletLoadingError.code)}
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
