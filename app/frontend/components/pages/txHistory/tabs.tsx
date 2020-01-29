import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'

const Tabs = ({displayStakingPage, toggleDisplayStakingPage}) => {
  return (
    <div className="tabinator">
      <input
        type="radio"
        id="sending"
        name="tabs"
        onClick={() => toggleDisplayStakingPage(false)}
      />
      <label htmlFor="sending">Sending</label>
      <input
        type="radio"
        id="staking"
        name="tabs"
        checked={displayStakingPage}
        onClick={() => toggleDisplayStakingPage(true)}
      />
      <label htmlFor="staking">Staking</label>
    </div>
  )
}

export default connect(
  (state) => ({
    displayStakingPage: state.displayStakingPage,
  }),
  actions
)(Tabs)
