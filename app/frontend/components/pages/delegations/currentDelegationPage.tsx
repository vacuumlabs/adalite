import {h, Fragment} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import formatDelegationDate from '../../../helpers/formatDelegationDate'

const CurrentDelegationPage = ({currentDelegation, revokeDelegation}) => {
  return (
    <div className="current-delegation card">
      <h2 className="card-title">Current delegation</h2>
      {currentDelegation ? (
        <div className="current-delegation-wrapper">
          {/* <div className="delegation-history-time">
            {formatDelegationDate(currentDelegation[0].time)}
          </div>
          <div /> */}
          {currentDelegation.map((pool) => [
            <div className="delegation-history-name">{pool.name}</div>,
            <div className="delegation-history-percent">{`${pool.ratio} %`}</div>,
            <div className="delegation-history-id">{pool.pool_id}</div>,
            <div />,
            <div className="delegation-history-id">{`Ticker: ${pool.ticker}`}</div>,
            <div />,
            <div className="delegation-history-id">{`Tax: ${(pool.rewards.ratio[0] * 100) /
              pool.rewards.ratio[1]}%`}</div>,
            <div />,
            <div className="delegation-history-id">
              {'Homepage: '}
              <a href={pool.homepage}>{pool.homepage}</a>
            </div>,
            <div />,
          ])}
        </div>
      ) : (
        <button className="button stake-pool" onClick={null}>
          The funds are currently undelegated. Delegate now.
        </button>
      )}
      <button className="button primary revoke-delegation" onClick={revokeDelegation}>
        Revoke current delegation
      </button>
    </div>
  )
}

export default connect(
  (state) => ({
    currentDelegation: state.shelleyAccountInfo.delegation,
  }),
  actions
)(CurrentDelegationPage)
