import {h} from 'preact'
import {useMemo} from 'preact/hooks'

const NufiBanner = ({variant = 'static'}: {variant: 'static' | 'gif'}) => {
  const {src, link} = useMemo(() => getRandomizedBannerProps(variant), [variant])

  return (
    <a className="banner nufi" href={link} rel="noopener" target="blank">
      <img src={src} alt="NuFi - Crypto Wallet" style={{width: '100%'}} />
    </a>
  )
}

type BannerProps = {
  src: string
  link: string
}

const getRandomizedBannerProps = (variant: 'static' | 'gif'): BannerProps => {
  if (variant === 'gif') {
    return {
      src: 'assets/nufi-animated-banner-light.gif',
      link: 'https://nu.fi/?utm_campaign=nufi-wallet-gif-banner',
    }
  }

  const staticBannerNumber = Math.floor(Math.random() * 3) + 1 // random number between 1 and 3
  return {
    src: `assets/nufi-animated-banner-light-${staticBannerNumber}.png`,
    link: `https://nu.fi/?utm_campaign=nufi-wallet-static-banner-${staticBannerNumber}`,
  }
}

export default NufiBanner
