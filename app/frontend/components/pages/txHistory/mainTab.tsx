import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'

const MainTab = ({
  caption,
  name,
  displayStakingPage,
  toggleDisplayStakingPage,
  checked = false,
}) => {
  return (
    <li>
      <input
        className={checked === displayStakingPage ? 'selected' : ''}
        type="radio"
        id={name}
        name="tabs"
        onClick={() => toggleDisplayStakingPage(checked)}
      />
      <label htmlFor={name}>{caption}</label>
    </li>
  )
}

export default connect(
  (state) => ({
    displayStakingPage: state.displayStakingPage,
  }),
  actions
)(MainTab)
