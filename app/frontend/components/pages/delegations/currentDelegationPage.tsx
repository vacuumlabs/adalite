import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import printAda from '../../../helpers/printAda'
import {Lovelace} from '../../../state'
import {CopyPoolId} from './common'
import {EpochDateTime} from '../common'
import {NETWORKS} from '../../../../frontend/wallet/constants'

const CurrentDelegationPage = ({
  pool,
  revokeDelegation,
  delegationValidationError,
  calculatingDelegationFee,
  nearestRewardDetails,
  currentDelegationRewardDetails,
}) => {
  return (
    <div className="current-delegation card">
      <h2 className="card-title small-margin">Current delegation</h2>
      {Object.keys(pool).length ? (
        <div>
          <div className="current-delegation-wrapper">
            <div className="current-delegation-name">
              {pool.name || 'Pool'}
              <CopyPoolId value={pool.poolHash} />
            </div>
            <div className="current-delegation-id">{pool.poolHash}</div>
            <div className="current-delegation-id">Ticker: {pool.ticker || ''}</div>
            <div className="current-delegation-id">Tax: {pool.margin * 100 || ''}%</div>
            <div className="current-delegation-id">
              Fixed cost: {printAda(parseInt(pool.fixedCost, 10) as Lovelace)}
            </div>
            <div className="current-delegation-id">
              {'Homepage: '}
              <a href={pool.homepage}>{pool.homepage}</a>
            </div>
            <div className="current-delegation-id">
              {'View on '}
              <a
                className="transaction-address"
                href={`https://cardanoscan.io/pool/${pool.poolHash}`}
              >
                CardanoScan
              </a>
            </div>
            <div className="current-delegation-id">
              Next reward:{' '}
              <EpochDateTime
                epoch={
                  currentDelegationRewardDetails.forEpoch +
                  NETWORKS.SHELLEY.MAINNET.epochsToRewardDistribution
                }
                dateTime={new Date(currentDelegationRewardDetails.rewardDate)}
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
      {nearestRewardDetails &&
        nearestRewardDetails.forEpoch !== currentDelegationRewardDetails.forEpoch && (
        <Fragment>
          <h2 className="card-title margin-top small-margin">Reward from previous pool</h2>
          <div className="current-delegation-wrapper">
            <div className="current-delegation-name">
              <span className="bold">{nearestRewardDetails.pool.name}</span>
              <CopyPoolId value={nearestRewardDetails.poolHash} />
            </div>
            <div className="current-delegation-id">{nearestRewardDetails.poolHash}</div>
            <div className="current-delegation-id">
                Next reward:{' '}
              <EpochDateTime
                epoch={
                  nearestRewardDetails.forEpoch +
                    NETWORKS.SHELLEY.MAINNET.epochsToRewardDistribution
                }
                dateTime={new Date(nearestRewardDetails.rewardDate)}
              />
            </div>
          </div>
        </Fragment>
      )}
    </div>
  )
}

export default connect(
  (state) => ({
    pool: state.shelleyAccountInfo.delegation,
    delegationValidationError: state.delegationValidationError,
    calculatingDelegationFee: state.calculatingDelegationFee,
    nearestRewardDetails: state.shelleyAccountInfo.rewardDetails.nearest,
    currentDelegationRewardDetails: state.shelleyAccountInfo.rewardDetails.currentDelegation,
  }),
  actions
)(CurrentDelegationPage)
