import CopyOnClick from '../../common/copyOnClick'
import {h} from 'preact'

export const CopyPoolId = ({value}) => {
  return (
    <CopyOnClick
      value={value}
      elementClass="address-link copy"
      tooltipMessage="Pool ID copied to clipboard"
    >
      <a className="copy-text ml-8" />
    </CopyOnClick>
  )
}

export const LinkIcon = ({url}) => {
  return (
    <span className="link">
      <a className="link-icon" href={url} target="_blank" rel="noopener" />
    </span>
  )
}

export const LinkIconToPool = ({poolHash}) => (
  <LinkIcon url={`https://cardanoscan.io/pool/${poolHash}`} />
)

export const LinkIconToKey = ({stakeKey}) => (
  <LinkIcon url={`https://cardanoscan.io/stakekey/${stakeKey}`} />
)

export const LinkToAsset = ({policyIdHex, assetNameHex}) => (
  <LinkIcon url={`https://cardanoscan.io/token/${policyIdHex}.${assetNameHex}`} />
)
