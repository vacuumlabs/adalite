import {Fragment, h} from 'preact'

type ViewAddressOnProps = {
  name: string
  url: string
  inline?: boolean
}

const ViewAddressOn = ({name, url, inline}: ViewAddressOnProps): h.JSX.Element =>
  inline ? (
    <a className="address-link" href={url} target="_blank" rel="noopener">
      {name}
    </a>
  ) : (
    <Fragment>
      View on{' '}
      <a className="address-link" href={url} target="_blank" rel="noopener">
        {name}
      </a>
    </Fragment>
  )

export default ViewAddressOn
