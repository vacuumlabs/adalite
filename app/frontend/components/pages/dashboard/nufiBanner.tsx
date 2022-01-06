import {h} from 'preact'

const NufiBanner = () => {
  return (
    <a
      className="banner nufi"
      href={`${window.location.origin}/nufi`}
      rel="noopener"
      target="blank"
    >
      <img src="assets/nufi-banner-large.gif" alt="NuFi - Crypto Wallet" style={{width: '80%'}} />
    </a>
  )
}

export default NufiBanner
