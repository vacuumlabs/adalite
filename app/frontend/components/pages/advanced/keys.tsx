import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {State, getActiveAccountInfo} from '../../../state'
import {parsePath} from '../../../helpers/pathParser'
import {LinkIconToKey} from '../delegations/common'
import tooltip from '../../common/tooltip'
import {HexString, _PubKeyCbor, _XPubKey} from '../../../types'

const DownloadKey = ({cborHex}) => {
  const fileContents = {
    type: 'StakeVerificationKeyShelley_ed25519',
    description: 'Stake Verification Key',
    cborHex,
  }
  const filename = 'stake.vrf'
  const filetype = 'application/json'

  const dataURI = `data:${filetype};json,${JSON.stringify(fileContents, null, 4)}`

  return <a href={dataURI} download={filename} className="download-key-text" />
}

type Props = {
  byronAccountXpub: _XPubKey
  shelleyAccountXpub: _XPubKey
  stakingAddressHex: HexString
  stakingKeyCborHex: _PubKeyCbor
  stakingAddress: string
}

const Keys = ({
  byronAccountXpub,
  shelleyAccountXpub,
  stakingAddressHex,
  stakingKeyCborHex,
  stakingAddress,
}: Props) => {
  return (
    <div className="card">
      <h2 className="card-title small-margin">Keys</h2>
      {byronAccountXpub && (
        <Fragment>
          <div className="advanced-label">
            Byron extended public key ({parsePath(byronAccountXpub.path)})
          </div>
          <div className="advanced-value">{byronAccountXpub.xpubHex}</div>
        </Fragment>
      )}
      <div className="advanced-label">
        Shelley extended public key ({parsePath(shelleyAccountXpub.path)})
      </div>
      <div className="advanced-value">{shelleyAccountXpub.xpubHex}</div>
      <div className="advanced-label">
        Staking key CBOR hex ({parsePath(stakingKeyCborHex.path)})
        <DownloadKey cborHex={stakingKeyCborHex.cborHex} />
        <a
          {...tooltip(
            'Staking key is needed for creating the stake pool ownership certificate.',
            true
          )}
        >
          <span className="show-info">{''}</span>
        </a>
      </div>
      <div className="advanced-value">{stakingKeyCborHex.cborHex}</div>
      {}
      <div className="advanced-label">
        Reward address <LinkIconToKey stakeKey={stakingAddress} />
      </div>
      <div className="advanced-value">{stakingAddress}</div>
      <div className="advanced-label">
        Staking key hex <LinkIconToKey stakeKey={stakingAddressHex.slice(2)} />
      </div>
      <div className="advanced-value">{stakingAddressHex.slice(2)}</div>
    </div>
  )
}

export default connect(
  (state: State) => ({
    shelleyAccountXpub: getActiveAccountInfo(state).keys.shelleyAccountXpub,
    byronAccountXpub: getActiveAccountInfo(state).keys.byronAccountXpub,
    stakingAddressHex: getActiveAccountInfo(state).keys.stakingAddressHex,
    stakingKeyCborHex: getActiveAccountInfo(state).keys.stakingKeyCborHex,
    stakingAddress: getActiveAccountInfo(state).keys.stakingAddress,
  }),
  actions
)(Keys)
