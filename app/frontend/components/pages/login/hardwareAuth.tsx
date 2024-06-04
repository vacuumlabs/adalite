import {Fragment, h} from 'preact'
import {CryptoProviderType} from '../../../wallet/types'
import {TrezorLogoWhite, LedgerLogoWhite, BitBoxLogoWhite} from '../../common/svg'
import {ADALITE_CONFIG} from '../../../config'
import tooltip from '../../common/tooltip'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import {useState, useCallback} from 'preact/hooks'
import {localStorageVars} from '../../../localStorage'
import {isMobileOnly} from 'react-device-detect'
import LedgerTransportSelect from './ledgerTransportSelect'
import {LedgerTransportChoice} from '../../../../frontend/types'
import styles from './hardwareAuth.module.scss'

const LoadByHardwareWalletSection = () => {
  const {loadWallet} = useActions(actions)
  const [enableBulkExport, setBulkExport] = useState(
    window.localStorage.getItem(localStorageVars.BULK_EXPORT) !== 'true'
  )
  const [ledgerTransportChoice, setLedgerTransportChoice] = useState(LedgerTransportChoice.DEFAULT)
  const toggleBulkExport = useCallback(() => {
    window.localStorage.setItem(localStorageVars.BULK_EXPORT, `${enableBulkExport}`)
    setBulkExport(!enableBulkExport)
  }, [enableBulkExport])

  const BitBox02AffiliateLink = (title) => (
    <a href="https://shiftcrypto.ch/bitbox02/?ref=8s4tkJYX1x" target="blank">
      {title}
    </a>
  )

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
            <img
              className="authentication-image"
              src="assets/trezor.jpg"
              alt="Trezor Model T/Safe 3"
            />
          </div>
          <div className="authentication-paragraph">Trezor Model T/Safe 3</div>
          <div className="authentication-paragraph small">
            {TrezorAffiliateLink('Support us by buying one')}
          </div>
          <div
            className="authentication-paragraph small"
            dangerouslySetInnerHTML={{__html: '&nbsp;'}}
          />
          <button
            disabled={!ADALITE_CONFIG.ADALITE_ENABLE_TREZOR || isMobileOnly}
            {...tooltip(
              'Support for Trezor is temporarily disabled',
              !ADALITE_CONFIG.ADALITE_ENABLE_TREZOR
            )}
            {...tooltip('Not supported on mobile devices', isMobileOnly)}
            className="button primary thin-data-balloon"
            onClick={() =>
              loadWallet({
                cryptoProviderType: CryptoProviderType.TREZOR,
                shouldExportPubKeyBulk: enableBulkExport,
              })
            }
          >
            <span className="authentication-button-label">Unlock with</span>
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
          <div className="authentication-paragraph">Ledger Nano S/S Plus/X</div>
          <div className="authentication-paragraph small">also with Android device</div>
          <div className="authentication-paragraph small">
            {LedgerAffiliateLink('Support us by buying one')}
          </div>
          <div>
            <button
              {...tooltip(
                'Support for Ledger is temporarily disabled',
                !ADALITE_CONFIG.ADALITE_ENABLE_LEDGER
              )}
              disabled={!ADALITE_CONFIG.ADALITE_ENABLE_LEDGER}
              className={`button primary thin-data-balloon ${styles.ledgerButton}`}
              onClick={() =>
                loadWallet({
                  cryptoProviderType: CryptoProviderType.LEDGER,
                  shouldExportPubKeyBulk: enableBulkExport,
                  ledgerTransportChoice,
                })
              }
            >
              <span className="authentication-button-label">Unlock with</span>
              <div className="ledger-logo-container">
                <LedgerLogoWhite />
              </div>
            </button>
            <div className={styles.transportWrapper}>
              <div className={styles.transportLabel}>
                Method
                <a
                  {...tooltip(
                    'If the "default" option doesn\'t work for you, try selecting other options from the list',
                    true
                  )}
                >
                  <span className="show-info">{''}</span>
                </a>
              </div>
              <LedgerTransportSelect
                selectedItem={ledgerTransportChoice}
                onSelect={setLedgerTransportChoice}
              />
            </div>
          </div>
        </div>
        <div className="authentication-wallet">
          <div className="authentication-image-container">
            <img className="authentication-image" src="assets/bitbox02.png" alt="BitBox02" />
          </div>
          <div className="authentication-paragraph">BitBox02</div>
          <div className="authentication-paragraph small">
            {BitBox02AffiliateLink('Support us by buying one')}
          </div>
          <div
            className="authentication-paragraph small"
            dangerouslySetInnerHTML={{__html: '&nbsp;'}}
          />
          <button
            disabled={!ADALITE_CONFIG.ADALITE_ENABLE_BITBOX02 || isMobileOnly}
            {...tooltip(
              'Support for BitBox02 is temporarily disabled',
              !ADALITE_CONFIG.ADALITE_ENABLE_BITBOX02
            )}
            {...tooltip('Not supported on mobile devices', isMobileOnly)}
            className="button primary thin-data-balloon"
            onClick={() =>
              loadWallet({
                cryptoProviderType: CryptoProviderType.BITBOX02,
                shouldExportPubKeyBulk: enableBulkExport,
              })
            }
          >
            <span className="authentication-button-label">Unlock with</span>
            <div className="bitbox-logo-container">
              <BitBoxLogoWhite />
            </div>
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

export default LoadByHardwareWalletSection
