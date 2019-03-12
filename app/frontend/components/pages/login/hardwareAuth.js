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
    {class: 'authentication-content hardware'},
    h(
      'div',
      {class: 'authentication-wallet'},
      h('img', {
        class: 'authentication-image',
        src: 'assets/trezor.jpg',
        alt: 'Trezor model T',
      }),
      h('div', {class: 'authentication-paragraph'}, 'Trezor model T'),
      h(
        'div',
        {class: 'authentication-paragraph small'},
        TrezorAffiliateLink('Support us by buying one')
      ),
      h(
        'button',
        {
          class: 'button primary trezor',
          onClick: () => loadWallet({cryptoProviderType: CRYPTO_PROVIDER_TYPES.TREZOR}),
        },
        'Unlock with'
      )
    ),
    h(
      'div',
      {class: 'authentication-wallet'},
      h('img', {
        class: 'authentication-image',
        src: 'assets/ledger.jpg',
        alt: 'Ledger Nano S',
      }),
      h('div', {class: 'authentication-paragraph'}, 'Ledger Nano S'),
      h(
        'div',
        {class: 'authentication-paragraph small'},
        disableLedgerByFlag ? 'coming soon' : LedgerAffiliateLink('Support us by buying one')
      ),
      h(
        'button',
        {
          class: `button ${disableLedger ? 'grey' : 'primary'} ledger`,
          disabled: disableLedger,
        },
        'Unlock with'
      )
    )
  )
}

module.exports = LoadByHardwareWalletSection
