import {h} from 'preact'

export const MainTab = ({name, selectedTab, selectTab, displayName = null}) => {
  return (
    <li className={`main-tab ${name === 'Staking' ? 'primary' : ''}`}>
      <input type="radio" id={name} name="tabs" onClick={() => selectTab(name)} />
      <label className={name === selectedTab ? 'selected' : ''} htmlFor={name}>
        {displayName || name}
      </label>
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
