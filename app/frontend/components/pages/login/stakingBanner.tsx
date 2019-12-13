import {h} from 'preact'

interface Props {
  closeBanner: () => void
}

const StakingBanner = ({closeBanner}: Props) => (
  <div className="banner">
    <div className="banner-text">
      AdaLite will support staking. We've just released balance check for incentivized testnet.{' '}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          window.history.pushState({}, 'staking', 'staking')
        }}
      >
        Read more
      </a>
    </div>
    <button
      className="button close banner-close"
      {
      ...{ariaLabel: 'Close banner'} /* silence ts*/
      }
      onClick={(e) => {
        closeBanner()
      }}
    />
  </div>
)

export default StakingBanner
