import {h} from 'preact'

interface Props {
  onRequestClose: () => void
}

const StakingBanner = ({onRequestClose}: Props) => (
  <div className="banner">
    <div className="banner-text">
      Stake with us on Shelley!{' '}
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
        onRequestClose()
      }}
    />
  </div>
)

export default StakingBanner
