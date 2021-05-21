import {MainTabs, SubTabs} from '../../../constants'
import {h} from 'preact'

type MainTabProps = {
  name: MainTabs
  setActiveTab: (name: MainTabs) => void
  isActive: boolean
  displayName: string | null
}

export const MainTab = ({name, setActiveTab, isActive, displayName = null}: MainTabProps) => {
  return (
    <li className={`main-tab ${name === MainTabs.VOTING ? 'primary' : ''}`}>
      <input type="radio" id={name} name="tabs" onClick={() => setActiveTab(name)} />
      <label className={isActive ? 'selected' : ''} htmlFor={name}>
        {displayName || name}
      </label>
    </li>
  )
}

type SubTabProps = {
  name: SubTabs
  setActiveTab: (name: SubTabs) => void
  isActive: boolean
}

export const SubTab = ({name, setActiveTab, isActive}: SubTabProps) => (
  <li className={`dashboard-tab ${isActive ? 'selected' : ''}`} onClick={() => setActiveTab(name)}>
    {name}
  </li>
)
