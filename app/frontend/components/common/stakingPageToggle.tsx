import {h} from 'preact'
import actions from '../../testnet/testnet-actions'
import {connect} from '../../libs/unistore/preact'

const StakingPageToggle = ({displayStakingPage, toggleDisplayStakingPage}) => {
  return (
    <div className="staking-page-toggle-wrapper">
      <div className="toggle-title">Sending</div>
      <label className="staking-page-toggle-switch">
        <input type="checkbox" checked={displayStakingPage} onChange={toggleDisplayStakingPage} />
        <span className="slider" />
      </label>
      <div className="toggle-title">Staking</div>
    </div>
  )
}

export default connect(
  (state) => ({
    displayStakingPage: state.displayStakingPage,
  }),
  actions
)(StakingPageToggle)
