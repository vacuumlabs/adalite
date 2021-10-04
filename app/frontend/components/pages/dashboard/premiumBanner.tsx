import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'

interface Props {
  closePremiumBanner: () => void
}

const PremiumBanner = ({closePremiumBanner}: Props) => {
  const premiumMessage =
    'VIP STAKING SERVICES - Do you own more than 3 million ADA? Contact us on info@adalite.io to join our VIP staking services. We will assign you a dedicated account manager and provide you with priority support.'
  return (
    <div className="banner premium">
      <div className="banner-text">{premiumMessage}</div>
      <button
        className="button close banner-close"
        {
        ...{ariaLabel: 'Close banner'} /* silence ts*/
        }
        onClick={(e) => {
          closePremiumBanner()
        }}
      />
    </div>
  )
}

export default connect(() => null, actions)(PremiumBanner)
