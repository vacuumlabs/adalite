import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import {Lovelace} from '../../../state'

const CurrentDelegationPage = ({
  pool,
  revokeDelegation,
  delegationValidationError,
  calculatingDelegationFee,
}) => {
  return (
    <div className="current-delegation card">
      <h2 className="card-title">Current delegation</h2>
      {Object.keys(pool).length ? (
        <div>
          <div className="current-delegation-wrapper">
            {/* <div className="delegation-history-name">
              {currentDelegation.name}
            </div>, */}
            <div className="delegation-history-id">{pool.poolHash}</div>
            <div className="delegation-history-id">Tax: {pool.margin}%</div>
            <div className="delegation-history-id">
              Fixed cost: {printAda(parseInt(pool.fixedCost, 10) as Lovelace)}
            </div>
            <div className="delegation-history-id">
              {'Homepage: '}
              <a href={pool.url}>{pool.url}</a>
            </div>
          </div>
          {/* <button
            className="button primary revokedelegation-delegation"
            onClick={revokeDelegation}
            disabled={delegationValidationError || calculatingDelegationFee}
          >
            Revoke current delegation
          </button> */}
        </div>
      ) : (
        <p>The funds are currently undelegated. Delegate now.</p>
      )}
    </div>
  )
}

export default connect(
  (state) => ({
    pool: state.shelleyAccountInfo.delegation,
    delegationValidationError: state.delegationValidationError,
    calculatingDelegationFee: state.calculatingDelegationFee,
  }),
  actions
)(CurrentDelegationPage)
