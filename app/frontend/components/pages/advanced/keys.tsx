import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

const Keys = ({byronXpub, shelleyXpub}) => {
  return (
    <div className="card">
      <h2 className="card-title small-margin">Keys</h2>
      <div className="current-delegation-wrapper">
        <b>{byronXpub.path.join("'/")}'</b>
        <div className="current-delegation-id">{byronXpub.xpub}</div>
        <b>{shelleyXpub.path.join("'/")}'</b>
        <div className="current-delegation-id">{shelleyXpub.xpub}</div>
      </div>
    </div>
  )
}

export default connect(
  (state) => ({
    shelleyXpub: state.shelleyAccountInfo.shelleyXpub,
    byronXpub: state.shelleyAccountInfo.byronXpub,
  }),
  actions
)(Keys)
