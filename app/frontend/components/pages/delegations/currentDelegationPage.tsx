import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import {State} from '../../../state'
import {LinkIconToPool} from './common'
import {EpochDateTime} from '../common'
import roundNumber from './../../../helpers/roundNumber'
import {SATURATION_POINT} from '../../../wallet/constants'
import {Lovelace} from '../../../types'
import {useActiveAccount, useIsActiveAccountDelegating} from '../../../selectors'
import BigNumber from 'bignumber.js'

const SaturationInfo = (pool) => {
  if (pool.liveStake == null) return <Fragment />
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
  revokeDelegation,
  delegationValidationError,
  calculatingDelegationFee,
}) => {
  const {
    shelleyAccountInfo: {
      delegation: pool,
      rewardDetails: {nearest: nearestReward, currentDelegation: currentDelegationReward},
    },
  } = useActiveAccount()
  const isDelegating = useIsActiveAccountDelegating()
  return (
    <div className="current-delegation card">
      <h2 className="card-title small-margin">Current Delegation</h2>
      {isDelegating ? (
        <div>
          <div className="current-delegation-wrapper">
            <div className="current-delegation-name">
              {pool.name || 'Pool'}
              <LinkIconToPool poolHash={pool.poolHash} />
            </div>
            <div className="current-delegation-id">{pool.poolHash}</div>
            {pool.ticker != null && (
              <div className="current-delegation-id">Ticker: {pool.ticker}</div>
            )}
            {pool.margin != null && (
              <div className="current-delegation-id">Tax: {pool.margin * 100}%</div>
            )}
            {pool.fixedCost != null && (
              <div className="current-delegation-id">
                Fixed cost: {printAda(new BigNumber(pool.fixedCost) as Lovelace)}
              </div>
            )}
            {pool.roa != null && pool.roa !== '0' && (
              <div className="current-delegation-id">ROA 30d: {pool.roa}%</div>
            )}
            {SaturationInfo(pool)}
            {pool.liveStake != null && (
              <div className="current-delegation-id">
                Live stake: {parseFloat(printAda(pool.liveStake as Lovelace)).toLocaleString('en')}
              </div>
            )}
            {pool.homepage != null && (
              <div className="current-delegation-id">
                {'Homepage: '}
                <a target="_blank" href={pool.homepage}>
                  {pool.homepage}
                </a>
              </div>
            )}
            {pool.poolHash != null && (
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
            )}
            {currentDelegationReward.distributionEpoch && currentDelegationReward.rewardDate && (
              <div className="current-delegation-id">
                Next reward:{' '}
                <EpochDateTime
                  epoch={currentDelegationReward.distributionEpoch}
                  dateTime={new Date(currentDelegationReward.rewardDate)}
                />
              </div>
            )}
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
    delegationValidationError: state.delegationValidationError,
    calculatingDelegationFee: state.calculatingDelegationFee,
  }),
  actions
)(CurrentDelegationPage)
