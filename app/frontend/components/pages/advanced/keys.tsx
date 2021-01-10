import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {State, getActiveAccountInfo} from '../../../state'
import {parsePath} from '../../../helpers/pathParser'
import {encode} from 'borc'
import {LinkIconToKey} from '../delegations/common'

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

const Keys = ({byronXpub, shelleyXpub, accountPubkeyHex, stakingKey, stakingAccountAddress}) => {
  return (
    <div className="card">
      <h2 className="card-title small-margin">Keys</h2>
      {byronXpub && (
        <Fragment>
          <div className="advanced-label">
            Byron extended public key ({parsePath(byronXpub.path)})
          </div>
          <div className="advanced-value">{byronXpub.xpub}</div>
        </Fragment>
      )}
      <div className="advanced-label">
        Shelley extended public key ({parsePath(shelleyXpub.path)})
      </div>
      <div className="advanced-value">{shelleyXpub.xpub}</div>
      <div className="advanced-label">
        Staking key CBOR hex ({parsePath(stakingKey.path)})
        <DownloadKey cborHex={encode(stakingKey.pub).toString('hex')} />
      </div>
      <div className="advanced-value">{encode(stakingKey.pub).toString('hex')}</div>
      {}
      <div className="advanced-label">
        Reward address <LinkIconToKey stakeKey={stakingAccountAddress} />
      </div>
      <div className="advanced-value">{stakingAccountAddress}</div>
      <div className="advanced-label">
        Staking key hex <LinkIconToKey stakeKey={accountPubkeyHex.slice(2)} />
      </div>
      <div className="advanced-value">{accountPubkeyHex.slice(2)}</div>
    </div>
  )
}

export default connect(
  (state: State) => ({
    shelleyXpub: getActiveAccountInfo(state).shelleyAccountInfo.shelleyXpub,
    byronXpub: getActiveAccountInfo(state).shelleyAccountInfo.byronXpub,
    accountPubkeyHex: getActiveAccountInfo(state).shelleyAccountInfo.accountPubkeyHex,
    stakingKey: getActiveAccountInfo(state).shelleyAccountInfo.stakingKey,
    stakingAccountAddress: getActiveAccountInfo(state).shelleyAccountInfo.stakingAccountAddress,
  }),
  actions
)(Keys)
