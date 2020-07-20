import {h, Component} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import TransactionErrorModal from '../../pages/sendAda/transactionErrorModal'
import {getTranslation} from '../../../translations'
import {errorHasHelp} from '../../../helpers/errorsWithHelp'
import ConfirmTransactionDialog from '../../pages/sendAda/confirmTransactionDialog'

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

const DelegationValidation = ({delegationValidationError, txSuccessTab}) =>
  txSuccessTab === 'stake' ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    delegationValidationError && (
      <div className="validation-message error">
        {getTranslation(delegationValidationError.code)}
      </div>
    )
  )

const StakePoolInfo = ({pool}) => {
  const {rewards, ticker, homepage, name, validationError} = pool
  const tax = rewards && (rewards.ratio[0] * 100) / rewards.ratio[1]
  const fixed = rewards && rewards.fixed && printAda(rewards.fixed)
  const limit = rewards && rewards.limit && printAda(rewards.limit)
  return (
    <div className={`stake-pool-info ${validationError ? 'invalid' : 'valid'}`}>
      {validationError ? (
        <div>{getTranslation(validationError.code)}</div>
      ) : (
        <div>
          <div>{`Name: ${name || ''}`}</div>
          <div>{`Ticker: ${ticker || ''}`}</div>
          <div>
            {`
            Tax: ${tax || ''}%
            ${fixed ? ` , ${`Fixed: ${fixed}`}` : ''}
            ${limit ? ` , ${`Limit: ${limit}`}` : ''}
          `}
          </div>
          <div>
            {'Homepage: '}
            <a href={homepage || ''}>{homepage || ''}</a>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  updateStakePoolIdentifier: any
  // updateStakePoolPercent,
  // addStakePool,
  removeStakePool: any
  stakePools: any
  delegationFee: any
  calculatingDelegationFee: any
  delegationValidationError: any
  changeDelegation: any
  confirmTransaction: any
  closeTransactionErrorModal: any
  transactionSubmissionError: any
  shouldShowTransactionErrorModal: any
  selectAdaliteStakepool: any
  shouldShowConfirmTransactionDialog: any
  txSuccessTab: any
}

class Delegate extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    // this.props.selectAdaliteStakepool()
  }

  render({
    updateStakePoolIdentifier,
    // updateStakePoolPercent,
    // addStakePool,
    removeStakePool,
    stakePools,
    delegationFee,
    calculatingDelegationFee,
    delegationValidationError,
    changeDelegation,
    confirmTransaction,
    closeTransactionErrorModal,
    transactionSubmissionError,
    shouldShowTransactionErrorModal,
    shouldShowConfirmTransactionDialog,
    txSuccessTab,
  }) {
    const delegationHandler = async () => {
      await confirmTransaction('delegate')
    }
    return (
      <div className="delegate card">
        <h2 className="card-title">Delegate Stake</h2>
        <div className="stakepools">
          <ul className="stake-pool-list">
            {stakePools.map((pool, i) => (
              <li key={i} className="stake-pool-item">
                <input
                  type="text"
                  className="input stake-pool-id"
                  name={`${i}`}
                  placeholder="Ticker or Stake Pool ID"
                  value={pool.poolIdentifier}
                  onInput={updateStakePoolIdentifier}
                  autoComplete="off"
                />
                {/* <div className="input-wrapper-percent">
                  <input
                    type="number"
                    min="0"
                    max={pool.percent + undelegatedPercent}
                    {...{accuracy: '1'}}
                    className="input stake-pool-percent"
                    name={`${i}`}
                    value={pool.percent}
                    placeholder={pool.percent}
                    onInput={updateStakePoolPercent}
                    autoComplete="off"
                  />
                  <div className="percent">%</div>
                </div> */}
                {/* {formatStakePoolInfo(getStakePoolValidationMessage(stakePools, pool))} */}
                <StakePoolInfo pool={pool} />
                {stakePools.length <= 1 || i === 0 ? (
                  <div />
                ) : (
                  <button className="button stake-pool" name={`${i}`} onClick={removeStakePool}>
                    remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="add-stake-pool-wrapper">
          {/* <button
            className="button add-stake-pool"
            id="add-stake-pool"
            onClick={addStakePool}
            disabled={false}
          >
            Add Another Stake Pool
          </button> */}
        </div>
        {/* <div className='stake-pool-info'>
          nvsd
        </div> */}
        <div className="delegation-info-row">
          {/* <label className="fee-label">Delegated</label>
          <div
            className={`delegation-percent${!delegationValidationError ? ' valid' : ''}`}
          >{`${delegatedPercent} %`}
          </div> */}
          <label className="fee-label">
            Fee<AdaIcon />
          </label>
          <div className="delegation-fee">{printAda(delegationFee)}</div>
        </div>
        <div className="validation-row">
          <button
            className="button primary staking"
            disabled={delegationValidationError || calculatingDelegationFee}
            onClick={delegationHandler}
            {...tooltip('100% of funds must be delegated to valid stake pools', false)}
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
      </div>
    )
  }
}

export default connect(
  (state) => ({
    stakePools: state.shelleyDelegation.selectedPools,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.shelleyDelegation.delegationFee,
    delegationValidationError: state.delegationValidationError,
    shouldShowTransactionErrorModal: state.shouldShowTransactionErrorModal,
    transactionSubmissionError: state.transactionSubmissionError,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    txSuccessTab: state.txSuccessTab,
  }),
  actions
)(Delegate)
