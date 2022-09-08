import {h} from 'preact'

const NufiBanner = ({variant = 'static'}: {variant: 'static' | 'gif'}) => {
  return (
    <a
      className="banner nufi"
      href={`${window.location.origin}/nufi`}
      rel="noopener"
      target="blank"
    >
      {variant === 'static' ? (
        <img
          src="assets/nufi-animated-banner-light.png"
          alt="NuFi - Crypto Wallet"
          style={{width: '100%'}}
        />
      ) : (
        <img
          src="assets/nufi-animated-banner-light.gif"
          alt="NuFi - Crypto Wallet"
          style={{width: '100%'}}
        />
      )}
    </a>
  )
}

export default NufiBanner
