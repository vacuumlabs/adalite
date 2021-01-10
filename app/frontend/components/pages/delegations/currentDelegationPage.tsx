import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import {Lovelace, State, getActiveAccountInfo} from '../../../state'
import {LinkIconToPool} from './common'
import {EpochDateTime} from '../common'
import roundNumber from './../../../helpers/roundNumber'
import {SATURATION_POINT} from '../../../wallet/constants'

const SaturationInfo = (pool) => {
  const liveStake = parseFloat(pool.liveStake)
  const saturationPercentage = roundNumber((liveStake / SATURATION_POINT) * 100, 2)
  return (
    <div className="current-delegation-id">
      Saturation percentage:
      <span className={saturationPercentage >= 99 ? 'error' : ''}> {saturationPercentage}%</span>
    </div>
  )
}

const CurrentDelegationPage = ({
  pool,
  revokeDelegation,
  delegationValidationError,
  calculatingDelegationFee,
  nearestReward,
  currentDelegationReward,
}) => {
  return (
    <div className="current-delegation card">
      <h2 className="card-title small-margin">Current Delegation</h2>
      {Object.keys(pool).length ? (
        <div>
          <div className="current-delegation-wrapper">
            <div className="current-delegation-name">
              {pool.name || 'Pool'}
              <LinkIconToPool poolHash={pool.poolHash} />
            </div>
            <div className="current-delegation-id">{pool.poolHash}</div>
            <div className="current-delegation-id">Ticker: {pool.ticker || ''}</div>
            <div className="current-delegation-id">Tax: {pool.margin * 100 || ''}%</div>
            <div className="current-delegation-id">
              Fixed cost: {printAda(parseInt(pool.fixedCost, 10) as Lovelace)}
            </div>
            {pool.roa !== '0' && <div className="current-delegation-id">ROA 30d: {pool.roa}%</div>}
            {SaturationInfo(pool)}
            <div className="current-delegation-id">
              Live stake: {parseFloat(printAda(pool.liveStake as Lovelace)).toLocaleString('en')}
            </div>
            <div className="current-delegation-id">
              {'Homepage: '}
              <a target="_blank" href={pool.homepage}>
                {pool.homepage}
              </a>
            </div>
            <div className="current-delegation-id">
              {'View on '}
              <a
                target="_blank"
                className="transaction-address"
                href={`https://adapools.org/pool/${pool.poolHash}`}
              >
                ADApools
              </a>
            </div>
            <div className="current-delegation-id">
              Next reward:{' '}
              <EpochDateTime
                epoch={currentDelegationReward.distributionEpoch}
                dateTime={new Date(currentDelegationReward.rewardDate)}
              />
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
      {nearestReward &&
        nearestReward.distributionEpoch !== currentDelegationReward.distributionEpoch && (
        <Fragment>
          <h2 className="card-title margin-top small-margin">Reward from previous pool</h2>
          <div className="current-delegation-wrapper">
            <div className="current-delegation-name">
              <span className="bold">{nearestReward.pool.name}</span>
              <LinkIconToPool poolHash={nearestReward.poolHash} />
            </div>
            <div className="current-delegation-id">{nearestReward.poolHash}</div>
            <div className="current-delegation-id">
                Next reward:{' '}
              <EpochDateTime
                epoch={nearestReward.distributionEpoch}
                dateTime={new Date(nearestReward.rewardDate)}
              />
            </div>
          </div>
        </Fragment>
      )}
    </div>
  )
}

export default connect(
  (state: State) => ({
    pool: getActiveAccountInfo(state).shelleyAccountInfo.delegation,
    delegationValidationError: state.delegationValidationError,
    calculatingDelegationFee: state.calculatingDelegationFee,
    nearestReward: getActiveAccountInfo(state).shelleyAccountInfo.rewardDetails.nearest,
    currentDelegationReward: getActiveAccountInfo(state).shelleyAccountInfo.rewardDetails
      .currentDelegation,
  }),
  actions
)(CurrentDelegationPage)
