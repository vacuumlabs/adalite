import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'

const MainTab = ({name, selectedTab, selectTab}) => {
  return (
    <li>
      <input
        className={name === selectedTab ? 'selected' : ''}
        type="radio"
        id={name}
        name="tabs"
        onClick={() => selectTab(name)}
      />
      <label htmlFor={name}>{name}</label>
    </li>
  )
}

export default connect(
  (state) => ({
    displayStakingPage: state.displayStakingPage,
  }),
  actions
)(MainTab)
