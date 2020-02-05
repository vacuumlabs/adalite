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

const StakePoolInfo = ({pool}) => {
  // TODO refactor
  const tax = pool.rewards && (pool.rewards.ratio[0] * 100) / pool.rewards.ratio[1]
  const fixed = pool.rewards && pool.rewards.fixed && printAda(pool.rewards.fixed)
  const limit = pool.rewards && pool.rewards.limit && printAda(pool.rewards.limit)
  return (
    <div className={`stake-pool-info ${pool.validationError ? 'invalid' : 'valid'}`}>
      {pool.validationError ? (
        <div>{getTranslation(pool.validationError.code)}</div>
      ) : (
        <div>
          <div>{`Name: ${pool.name || ''}`}</div>
          <div>{`Ticker: ${pool.ticker || ''}`}</div>
          <div>
            {`
            Tax: ${tax || ''}%
            ${fixed ? ` , ${`Fixed: ${fixed}`}` : ''}
            ${limit ? ` , ${`Limit: ${limit}`}` : ''}
          `}
          </div>
          <div>
            {'Homepage: '}
            <a href={pool.homepage || ''}>{pool.homepage || ''}</a>
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
  submitTransaction: any
  closeTransactionErrorModal: any
  transactionSubmissionError: any
  showTransactionErrorModal: any
  selectAdaliteStakepool: any
  showConfirmTransactionDialog: any
}

class Delegate extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.props.selectAdaliteStakepool()
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
    submitTransaction,
    closeTransactionErrorModal,
    transactionSubmissionError,
    showTransactionErrorModal,
    showConfirmTransactionDialog,
  }) {
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
            onClick={submitTransaction}
            {...tooltip('100% of funds must be delegated to valid stake pools', false)}
          >
            Delegate
          </button>
          {[
            delegationValidationError && (
              <div className="validation-message error">
                {getTranslation(delegationValidationError.code)}
              </div>
            ), // TODO refactor
            calculatingDelegationFee && <CalculatingFee />,
          ]}
        </div>
        {showTransactionErrorModal && (
          <TransactionErrorModal
            onRequestClose={closeTransactionErrorModal}
            errorMessage={getTranslation(
              transactionSubmissionError.code,
              transactionSubmissionError.params
            )}
            showHelp={errorHasHelp(transactionSubmissionError.code)}
          />
        )}
        {showConfirmTransactionDialog && <ConfirmTransactionDialog />}
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
    showTransactionErrorModal: state.showTransactionErrorModal,
    transactionSubmissionError: state.transactionSubmissionError,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
  }),
  actions
)(Delegate)
