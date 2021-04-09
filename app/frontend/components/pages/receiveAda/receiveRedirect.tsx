import {h} from 'preact'
import actions from '../../../actions'
import {MainTabs} from '../../../../frontend/constants'
import {useActions} from '../../../helpers/connect'

const ReceiveRedirect = (): h.JSX.Element => {
  const {setActiveMainTab} = useActions(actions)
  const redirect = () => {
    setActiveMainTab(MainTabs.RECEIVE)
    window.scrollTo(0, 0)
  }

  return (
    <div className="addresses card">
      <h2 className="card-title">My Addresses</h2>
      <div className="addresses-content">
        This card has been moved to <a onClick={redirect}>Receive</a> tab.
      </div>
    </div>
  )
}

export default ReceiveRedirect
