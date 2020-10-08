import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

const Keys = ({stakePubKeyHex, stakePubKeyAddress}) => {
  console.log(stakePubKeyHex)
  return (
    <div className="card">
      <h2 className="card-title small-margin">Keys</h2>
      <div className="current-delegation-wrapper">
        <b>Staking public key hex:</b>
        {/* <div className="current-delegation-id">{pool.poolHash}</div>
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
            epoch={currentDelegationReward.distributionEpoch}
            dateTime={new Date(currentDelegationReward.rewardDate)}
          />
        </div> */}
      </div>
      {stakePubKeyHex}
    </div>
  )
}

export default connect(
  (state) => ({
    stakePubKeyHex: state.shelleyAccountInfo.stakePubKeyHex,
    stakePubKeyAddress: state.shelleyAccountInfo.accountPubkeyHex,
  }),
  actions
)(Keys)
