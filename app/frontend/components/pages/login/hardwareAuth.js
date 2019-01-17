const {h} = require('preact')
const {CRYPTO_PROVIDER_TYPES} = require('../../../wallet/constants')
const {
  ADALITE_CONFIG: {DISABLE_LEDGER},
} = require('../../../config')

const LoadByHardwareWalletSection = ({loadWallet}) => {
  const TrezorAffiliateLink = (title) =>
    h('a', {href: 'https://shop.trezor.io/?offer_id=10&aff_id=1071', target: 'blank'}, title)

  const LedgerAffiliateLink = (title) =>
    h('a', {href: 'https://www.ledger.com/?r=8410116f31f3', target: 'blank'}, title)

  // it doesn't work on Firefox even if U2F is enabled
  const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1
  const disableLedgerByFlag = DISABLE_LEDGER === 'true'
  const disableLedger = disableLedgerByFlag || isFirefox

  return h(
    'div',
    {class: 'authentication-content centered'},
    h(
      'div',
      {class: 'authentication-paragraph'},
      'AdaLite supports Trezor model T (firmware version >= 2.0.8)'
    ),
    h(
      'button',
      {
        class: 'button primary trezor',
        onClick: () => loadWallet({cryptoProviderType: CRYPTO_PROVIDER_TYPES.TREZOR}),
      },
      'Unlock with'
    )
  )
}

module.exports = LoadByHardwareWalletSection
