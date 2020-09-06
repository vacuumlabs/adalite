import {h, Fragment} from 'preact'

import {connect} from '../../../helpers/connect'
import actions from '../../../actions'

const AccountBar = ({setWalletInfo}) => {
  return (
    <Fragment>
      <button onClick={() => setWalletInfo(0)}>0</button>
      <button onClick={() => setWalletInfo(1)}>1</button>
      <button onClick={() => setWalletInfo(2)}>2</button>
      <button onClick={() => setWalletInfo(3)}>3</button>
    </Fragment>
  )
}

export default connect(
  () => null,
  actions
)(AccountBar)
