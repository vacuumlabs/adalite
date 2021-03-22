import {Fragment, h} from 'preact'
import {CryptoProviderType} from '../../../wallet/types'
import {TrezorLogoWhite, LedgerLogoWhite} from '../../common/svg'
import {ADALITE_CONFIG} from '../../../config'
import tooltip from '../../common/tooltip'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import {useState, useCallback} from 'preact/hooks'
import {localStorageVars} from '../../../localStorage'

interface Props {
  loadWallet: any
}

const LoadByHardwareWalletSection = ({loadWallet}: Props) => {
  const [enableBulkExport, setBulkExport] = useState(
    window.localStorage.getItem(localStorageVars.BULK_EXPORT) !== 'true'
  )
  const toggleBulkExport = useCallback(() => {
    window.localStorage.setItem(localStorageVars.BULK_EXPORT, `${enableBulkExport}`)
    setBulkExport(!enableBulkExport)
  }, [enableBulkExport])

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
    <Fragment>
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
            {...tooltip(
              'Support for Trezor is temporarily disabled',
              !ADALITE_CONFIG.ADALITE_ENABLE_TREZOR
            )}
            className="button primary trezor thin-data-balloon"
            onClick={() =>
              loadWallet({
                cryptoProviderType: CryptoProviderType.TREZOR,
                shouldExportPubKeyBulk: enableBulkExport,
              })
            }
          >
            Unlock with
            <div className="trezor-logo-container">
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
            {...tooltip(
              'Support for Ledger is temporarily disabled',
              !ADALITE_CONFIG.ADALITE_ENABLE_LEDGER
            )}
            disabled={!ADALITE_CONFIG.ADALITE_ENABLE_LEDGER}
            className="button primary ledger thin-data-balloon"
            onClick={() =>
              loadWallet({
                cryptoProviderType: CryptoProviderType.LEDGER,
                shouldExportPubKeyBulk: enableBulkExport,
              })
            }
          >
            Unlock with
            <div className="ledger-logo-container">
              <LedgerLogoWhite />
            </div>
          </button>
          <div className="authentication-paragraph small">
            alternatively, if the above does not work:
          </div>
          <button
            className="button secondary ledger-webusb"
            onClick={() =>
              loadWallet({
                cryptoProviderType: CryptoProviderType.LEDGER,
                forceWebUsb: true,
                shouldExportPubKeyBulk: enableBulkExport,
              })
            }
          >
            Connect with WebUSB
          </button>
        </div>
      </div>
      <div className="authentication-hw-bulk-public-export">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={enableBulkExport}
            onChange={toggleBulkExport}
            className="checkbox-input"
          />
          <span className="checkbox-indicator" />
          Bulk export public keys
        </label>
      </div>
    </Fragment>
  )
}

export default connect((state) => ({}), actions)(LoadByHardwareWalletSection)
