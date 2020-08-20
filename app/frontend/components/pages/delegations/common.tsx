import CopyOnClick from '../../common/copyOnClick'
import {h} from 'preact'

export const CopyPoolId = ({value}) => {
  return (
    <CopyOnClick
      value={value}
      elementClass="address-link copy"
      inline
      tooltipMessage="Pool ID copied to clipboard"
    >
      <a className="copy-text ml-8" />
    </CopyOnClick>
  )
}
