import {h, Fragment} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'

const CurrentDelegationPage = ({
  currentDelegation,
  revokeDelegation,
  delegationValidationError,
  calculatingDelegationFee,
}) => {
  return (
    <div className="current-delegation card">
      <h2 className="card-title">Current delegation</h2>
      {currentDelegation.length ? (
        <div>
          <div className="current-delegation-wrapper">
            {/* <div className="delegation-history-time">
              {formatDelegationDate(currentDelegation[0].time)}
            </div>
            <div /> */}
            {currentDelegation.map((pool) => [
              <div className="delegation-history-name">{pool.name}</div>,
              <div className="delegation-history-percent">{`${pool.ratio} %`}</div>,
              <div className="delegation-history-id">{pool.pool_id}</div>,
              <div className="delegation-history-id">{`Ticker: ${pool.ticker}`}</div>,
              <div className="delegation-history-id">
                {`
                Tax: ${(pool.rewards.ratio[0] * 100) / pool.rewards.ratio[1] || ''}%
                ${pool.rewards.fixed ? ` , ${`Fixed: ${printAda(pool.rewards.fixed)}`}` : ''}
                ${pool.rewards.limit ? ` , ${`Limit: ${printAda(pool.rewards.limit)}`}` : ''}
              `}
              </div>,
              <div className="delegation-history-id">
                {'Homepage: '}
                <a href={pool.homepage}>{pool.homepage}</a>
              </div>,
            ])}
          </div>
          <button
            className="button primary revoke-delegation"
            onClick={revokeDelegation}
            disabled={delegationValidationError || calculatingDelegationFee}
          >
            Revoke current delegation
          </button>
        </div>
      ) : (
        <p>The funds are currently undelegated. Delegate now.</p>
      )}
    </div>
  )
}

export default connect(
  (state) => ({
    currentDelegation: state.shelleyAccountInfo.delegation,
    delegationValidationError: state.delegationValidationError,
    calculatingDelegationFee: state.calculatingDelegationFee,
  }),
  actions
)(CurrentDelegationPage)
