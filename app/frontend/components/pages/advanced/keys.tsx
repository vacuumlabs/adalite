import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {parsePath} from '../../../helpers/pathParser'
import {LinkIconToKey} from '../delegations/common'
import tooltip from '../../common/tooltip'
import {bechAddressToHex, xpubHexToCborPubHex} from '../../../wallet/shelley/helpers/addresses'
import {useActiveAccount} from '../../../selectors'

const DownloadKey = ({cborHex}) => {
  const fileContents = {
    type: 'StakeVerificationKeyShelley_ed25519',
    description: 'Stake Verification Key',
    cborHex,
  }
  const filename = 'stake.vkey'
  const filetype = 'application/json'

  const dataURI = `data:${filetype};json,${JSON.stringify(fileContents, null, 4)}`

  return (
    <a
      href={dataURI}
      download={filename}
      className="download-key-text"
      data-cy="DownloadStakeKey"
    />
  )
}

const Keys = () => {
  const {
    accountXpubs: {byronAccountXpub, shelleyAccountXpub},
    stakingAddress,
    stakingXpub,
  } = useActiveAccount()

  return (
    <div className="card" data-cy="AdvancedKeyCard">
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
        Staking key CBOR hex ({parsePath(stakingXpub.path)})
        <DownloadKey cborHex={xpubHexToCborPubHex(stakingXpub.xpubHex)} />
        <a
          {...tooltip(
            'Staking key is needed for creating the stake pool ownership certificate.',
            true
          )}
        >
          <span className="show-info">{''}</span>
        </a>
      </div>
      <div className="advanced-value">{xpubHexToCborPubHex(stakingXpub.xpubHex)}</div>
      {}
      <div className="advanced-label">
        Reward address <LinkIconToKey stakeKey={stakingAddress} />
      </div>
      <div className="advanced-value">{stakingAddress}</div>
      <div className="advanced-label">
        Staking key hash hex <LinkIconToKey stakeKey={stakingAddress} />
      </div>
      <div className="advanced-value">{bechAddressToHex(stakingAddress)}</div>
    </div>
  )
}

export default connect(null, actions)(Keys)
