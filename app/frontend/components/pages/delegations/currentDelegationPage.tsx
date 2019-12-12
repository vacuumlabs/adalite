import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

const CurrentDelegationPage = ({currentDelegation}) => {
  return (
    <div className="current-delegation card">
      <h2 className="card-title">Current delegation</h2>
      {currentDelegation ? (
        <div className="current-delegation-wrapper">
          <div className="delegation-history-time">{currentDelegation.timeIssued}</div>
          <div />
          {currentDelegation.stakePools.map((pool) => [
            <div className="delegation-history-name">{pool.name}</div>,
            <div className="delegation-history-percent">{`${pool.percent} %`}</div>,
            <div className="delegation-history-id">{pool.id}</div>,
            <div />,
          ])}
        </div>
      ) : (
        <button className="button stake-pool" onClick={null}>
          The funds are currently undelegated. Delegate now.
        </button>
      )}
      <button className="button primary revoke-delegation">Revoke current delegation</button>
    </div>
  )
}

export default connect(
  (state) => ({
    currentDelegation: state.currentDelegation,
  }),
  actions
)(CurrentDelegationPage)
