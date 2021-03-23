import CopyOnClick from '../../common/copyOnClick'
import LinkIcon from '../../common/linkIcon'
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

export const LinkIconToPool = ({poolHash}) => (
  <LinkIcon url={`https://cardanoscan.io/pool/${poolHash}`} />
)

export const LinkIconToKey = ({stakeKey}) => (
  <LinkIcon url={`https://cardanoscan.io/stakekey/${stakeKey}`} />
)
