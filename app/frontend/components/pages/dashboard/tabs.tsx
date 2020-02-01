import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'

export const MainTab = ({name, selectedTab, selectTab}) => {
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

export const SubTab = ({name, selectedTab, selectTab}) => (
  <li
    className={`dashboard-tab ${name === selectedTab ? 'selected' : ''}`}
    onClick={() => selectTab(name)}
  >
    {name}
  </li>
)
