import {h} from 'preact'

const LinkIcon = ({url}) => {
  return (
    <span className="link">
      <a className="link-icon" href={url} target="_blank" rel="noopener" />
    </span>
  )
}

export default LinkIcon
