import {h} from 'preact'
import {useSelector, useActions} from '../../helpers/connect'
import actions from '../../actions'
import Branding from './branding'
import {
  BTC_BLOCKCHAIN_EXPLORER,
  BTC_DONATION_ADDRESS,
  ETH_BLOCKCHAIN_EXPLORER,
  ETH_DONATION_ADDRESS,
} from '../../wallet/constants'
import getDonationAddress from '../../helpers/getDonationAddress'
import {getCexplorerUrl} from '../../helpers/common'

interface Props {
  showConversionRates: boolean
  shouldShowContactFormModal: any
}

const showRatesOn = ['/txHistory', '/send']

const Footer = () => {
  const showConversionRates = useSelector(
    (state) => showRatesOn.indexOf(state.router.pathname) !== -1 && state.walletIsLoaded
  )
  const {shouldShowContactFormModal} = useActions(actions)

  return (
    <footer className="footer">
      <div className="footer-wrapper">
        <Branding dark={false} />
        <div className="footer-row">
          <div className="social">
            <button
              role="button"
              className="social-link email"
              onClick={shouldShowContactFormModal}
            >
              Contact us
            </button>
            <a
              href="https://t.me/AdaLite"
              target="_blank"
              rel="noopener"
              className="social-link telegram"
            >
              Telegram
            </a>
            <a
              href="https://github.com/vacuumlabs/adalite"
              target="_blank"
              rel="noopener"
              className="social-link github"
            >
              View on Github
            </a>
            <a
              href="https://twitter.com/AdaLiteWallet"
              target="_blank"
              rel="noopener"
              className="social-link twitter"
            >
              Twitter
            </a>
          </div>
          <div className="donations">
            <h3 className="donations-title">Donations are appreciated</h3>
            <a
              className="donations-item bitcoin"
              href={BTC_BLOCKCHAIN_EXPLORER + BTC_DONATION_ADDRESS}
              target="_blank"
              title="Donate via Bitcoin"
              rel="noopener"
            >
              BTC
            </a>
            <a
              className="donations-item ether"
              href={ETH_BLOCKCHAIN_EXPLORER + ETH_DONATION_ADDRESS}
              target="_blank"
              title="Donate via Ethereum"
              rel="noopener"
            >
              ETH
            </a>
            <a
              className="donations-item ada"
              href={`${getCexplorerUrl()}/address/${getDonationAddress()}`}
              target="_blank"
              title="Donate via Adalite"
              rel="noopener"
            >
              ADA
            </a>
          </div>
        </div>
        {showConversionRates && (
          <div className="conversion">
            Conversion rates from{' '}
            <a
              className="conversion-link"
              href="https://www.cryptocompare.com/api/"
              target="_blank"
              rel="noopener"
            >
              CryptoCompare
            </a>
          </div>
        )}
      </div>
    </footer>
  )
}

export default Footer
