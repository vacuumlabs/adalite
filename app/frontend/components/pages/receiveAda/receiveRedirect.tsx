import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {MainTabs} from '../../../../frontend/constants'

type ReceiveRedirectProps = {
  setActiveMainTab: (mainTab: MainTabs) => void
}

const ReceiveRedirect = ({setActiveMainTab}: ReceiveRedirectProps) => {
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

export default connect(null, actions)(ReceiveRedirect)
