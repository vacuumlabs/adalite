import {h, Component, Fragment} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import TransactionErrorModal from '../../pages/sendAda/transactionErrorModal'
import {getTranslation} from '../../../translations'
import {errorHasHelp} from '../../../helpers/errorsWithHelp'
import ConfirmTransactionDialog from '../../pages/sendAda/confirmTransactionDialog'
import {sourceAccountState, Lovelace, State} from '../../../state'
import {ADALITE_CONFIG} from '../../../config'
import Accordion from '../../common/accordion'

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

const DelegationValidation = ({delegationValidationError, txSuccessTab}) =>
  txSuccessTab === 'stake' && !delegationValidationError ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    delegationValidationError && (
      <div className="validation-message error">
        {getTranslation(delegationValidationError.code)}
      </div>
    )
  )

const StakePoolInfo = ({pool, gettingPoolInfo}) => {
  const {fixedCost, homepage, margin, ticker, name, validationError} = pool
  return (
    <div className={`stake-pool-info ${validationError ? 'invalid' : 'valid'}`}>
      {validationError ? (
        <div>{getTranslation(validationError.code)}</div>
      ) : gettingPoolInfo ? (
        <div>Getting pool info..</div>
      ) : (
        <div>
          <div>{`Name: ${name || ''}`}</div>
          <div>{`Ticker: ${ticker || ''}`}</div>
          <div>
            <a
              {...tooltip(
                'Tax is deducted from the rewards that pool distributes to the delegators.',
                true
              )}
            >
              <span className="delegation show-info">{''}</span>
            </a>
            {`Tax: ${margin * 100 || ''}`}%
          </div>
          <div>
            <a
              {...tooltip(
                'Fixed cost of the pool is taken from the pool rewards every epoch. This fee is shared among all delegators of the pool, not per delegator. Minimum value is 340 ADA.',
                true
              )}
            >
              <span className="delegation show-info">{''}</span>
            </a>
            {`Fixed cost: ${fixedCost ? printAda(parseInt(fixedCost, 10) as Lovelace) : ''}`}
          </div>
          <div>
            {'Homepage: '}
            <a target="_blank" href={homepage || ''}>
              {homepage || ''}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

const BigDelegatorOffer = () => (
  <div className="banner delegation-offer delegation-offer-text">
    Due to factors such as pool saturation, maximizing staking rewards is no easy task for high
    balance wallets like yours. Get our premium assistance via{' '}
    <a href="https://t.me/pepo6969" target="_blank" rel="noopener">
      Telegram
    </a>{' '}
    or at <a href={'mailto:michal.petro@vacuumlabs.com'}>michal.petro@vacuumlabs.com</a>.
  </div>
)

interface Props {
  updateStakePoolIdentifier: any
  removeStakePool: any
  stakePool: any
  delegationFee: any
  calculatingDelegationFee: any
  delegationValidationError: any
  isShelleyCompatible: any
  confirmTransaction: any
  closeTransactionErrorModal: any
  transactionSubmissionError: any
  shouldShowTransactionErrorModal: any
  selectAdaliteStakepool: any
  shouldShowConfirmTransactionDialog: any
  txSuccessTab: any
  gettingPoolInfo: boolean
  poolRecommendation: any
  pool: any
  isBigDelegator: boolean
  withAccordion: boolean
  title: string
}

class Delegate extends Component<Props, {dropShadow: boolean}> {
  constructor(props) {
    super(props)
    this.state = {
      dropShadow: false,
    }
  }

  componentDidMount() {
    if (ADALITE_CONFIG.ADALITE_STAKE_POOL_ID !== '') this.props.selectAdaliteStakepool()
  }

  render({
    updateStakePoolIdentifier,
    stakePool,
    delegationFee,
    calculatingDelegationFee,
    delegationValidationError,
    isShelleyCompatible,
    confirmTransaction,
    closeTransactionErrorModal,
    transactionSubmissionError,
    shouldShowTransactionErrorModal,
    shouldShowConfirmTransactionDialog,
    txSuccessTab,
    gettingPoolInfo,
    poolRecommendation,
    pool,
    isBigDelegator,
    withAccordion,
    title,
  }) {
    const delegationHandler = async () => {
      await confirmTransaction('delegate')
    }
    const validationError =
      delegationValidationError || stakePool.validationError || stakePool.poolHash === ''

    const delegationHeader = <h2 className="card-title no-margin">{title}</h2>
    const delegationContent = (
      <Fragment>
        <div className="stake-pool">
          <ul className="stake-pool-list">
            <li className="stake-pool-item">
              {isBigDelegator && <BigDelegatorOffer />}
              <div
                className={`input stake-pool-id delegation-input-row ${
                  this.state.dropShadow ? 'focus' : ''
                }`}
              >
                <div className="delegation-input-label">Stake Pool ID:</div>
                <input
                  type="text"
                  className="delegation-input"
                  name={'pool'}
                  value={stakePool.poolHash}
                  onInput={updateStakePoolIdentifier}
                  autoComplete="off"
                  onFocus={() => this.setState({dropShadow: true})}
                  onBlur={() => this.setState({dropShadow: false})}
                />
              </div>
              <StakePoolInfo pool={stakePool} gettingPoolInfo={gettingPoolInfo} />
              <div />
            </li>
          </ul>
        </div>

        <div className="add-stake-pool-wrapper" />
        <div className="delegation-info-row">
          <label className="fee-label">
            Fee<AdaIcon />
          </label>
          <div className="delegation-fee">{printAda(delegationFee)}</div>
        </div>
        <div className="validation-row">
          <button
            className="button primary"
            disabled={
              !isShelleyCompatible ||
              validationError ||
              calculatingDelegationFee ||
              stakePool.poolHash === ''
            }
            onClick={delegationHandler}
            {...tooltip(
              'You are using Shelley incompatible wallet. To delegate your ADA, follow the instructions to convert your wallet.',
              !isShelleyCompatible
            )}
          >
            Delegate
          </button>
          {[
            calculatingDelegationFee ? (
              <CalculatingFee />
            ) : (
              <DelegationValidation
                delegationValidationError={delegationValidationError}
                txSuccessTab={txSuccessTab}
              />
            ),
          ]}
        </div>
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
        {shouldShowConfirmTransactionDialog && <ConfirmTransactionDialog isDelegation />}
      </Fragment>
    )

    return (
      <div className="delegate card">
        {withAccordion ? (
          <Accordion
            initialVisibility={
              poolRecommendation.shouldShowSaturatedBanner || !Object.keys(pool).length
            }
            header={delegationHeader}
            body={delegationContent}
          />
        ) : (
          <Fragment>
            {delegationHeader}
            {delegationContent}
          </Fragment>
        )}
      </div>
    )
  }
}

Delegate.defaultProps = {
  withAccordion: true,
  title: 'Delegate Stake',
}

export default connect(
  (state: State) => ({
    stakePool: state.shelleyDelegation.selectedPool,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.shelleyDelegation.delegationFee,
    delegationValidationError: state.delegationValidationError,
    shouldShowTransactionErrorModal: state.shouldShowTransactionErrorModal,
    transactionSubmissionError: state.transactionSubmissionError,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    txSuccessTab: state.txSuccessTab,
    gettingPoolInfo: state.gettingPoolInfo,
    isShelleyCompatible: state.isShelleyCompatible,
    poolRecommendation: sourceAccountState(state).poolRecommendation,
    pool: sourceAccountState(state).shelleyAccountInfo.delegation,
    isBigDelegator: state.isBigDelegator,
  }),
  actions
)(Delegate)
