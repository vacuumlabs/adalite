import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

const Keys = ({byronXpub, shelleyXpub, accountPubkeyHex}) => {
  return (
    <div className="card">
      <h2 className="card-title small-margin">Keys</h2>
      <div className="advanced-label">Byron extended public key ({byronXpub.path.join("'/")}')</div>
      <div className="advanced-value">{byronXpub.xpub}</div>
      <div className="advanced-label">
        Shelley extended public key ({shelleyXpub.path.join("'/")}')
      </div>
      <div className="advanced-value">{shelleyXpub.xpub}</div>
      <div className="advanced-label">Reward address</div>
      <div className="advanced-value">{accountPubkeyHex}</div>
      <div className="advanced-label">Stake key</div>
      <div className="advanced-value">{accountPubkeyHex.slice(2)}</div>
    </div>
  )
}

export default connect(
  (state) => ({
    shelleyXpub: state.shelleyAccountInfo.shelleyXpub,
    byronXpub: state.shelleyAccountInfo.byronXpub,
    accountPubkeyHex: state.shelleyAccountInfo.accountPubkeyHex,
  }),
  actions
)(Keys)
