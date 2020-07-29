import {h} from 'preact'
import {CRYPTO_PROVIDER_TYPES} from '../../../wallet/constants'
import {TrezorLogoWhite, LedgerLogoWhite} from '../../common/svg'
import {ADALITE_CONFIG} from '../../../config'

interface Props {
  loadWallet: any
}

const LoadByHardwareWalletSection = ({loadWallet}: Props) => {
  const TrezorAffiliateLink = (title) => (
    <a href="https://shop.trezor.io/?offer_id=10&aff_id=1071" target="blank">
      {title}
    </a>
  )

  const LedgerAffiliateLink = (title) => (
    <a href="https://www.ledger.com/?r=8410116f31f3" target="blank">
      {title}
    </a>
  )

  return (
    <div className="authentication-content hardware">
      <div className="authentication-wallet">
        <div className="authentication-image-container">
          <img className="authentication-image" src="assets/trezor.jpg" alt="Trezor model T" />
        </div>
        <div className="authentication-paragraph">Trezor model T</div>
        <div className="authentication-paragraph small">
          {TrezorAffiliateLink('Support us by buying one')}
        </div>
        <div
          className="authentication-paragraph small"
          dangerouslySetInnerHTML={{__html: '&nbsp;'}}
        />
        <button
          disabled={!ADALITE_CONFIG.ADALITE_ENABLE_TREZOR}
          className="button primary trezor"
          onClick={() => loadWallet({cryptoProviderType: CRYPTO_PROVIDER_TYPES.TREZOR})}
        >
          Unlock with<div className="trezor-logo-container">
            <TrezorLogoWhite />
          </div>
        </button>
      </div>
      <div className="authentication-wallet">
        <div className="authentication-image-container">
          <img
            className="authentication-image"
            src="assets/ledger_nano_s_x.jpg"
            alt="Ledger Nano S/X"
          />
        </div>
        <div className="authentication-paragraph">Ledger Nano S/X</div>
        <div className="authentication-paragraph small">also with Android device</div>
        <div className="authentication-paragraph small">
          {LedgerAffiliateLink('Support us by buying one')}
        </div>
        <button
          disabled={!ADALITE_CONFIG.ADALITE_ENABLE_LEDGER}
          className="button primary ledger"
          onClick={() => loadWallet({cryptoProviderType: CRYPTO_PROVIDER_TYPES.LEDGER})}
        >
          Unlock with<div className="ledger-logo-container">
            <LedgerLogoWhite />
          </div>
        </button>
      </div>
    </div>
  )
}

export default LoadByHardwareWalletSection
