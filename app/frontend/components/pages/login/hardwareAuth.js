const {h} = require('preact')
const {CRYPTO_PROVIDER_TYPES} = require('../../../wallet/constants')

const LoadByHardwareWalletSection = ({loadWallet}) => {
  const TrezorAffiliateLink = (title) =>
    h('a', {href: 'https://shop.trezor.io/?offer_id=10&aff_id=1071', target: 'blank'}, title)

  const LedgerAffiliateLink = (title) =>
    h('a', {href: 'https://www.ledger.com/?r=8410116f31f3', target: 'blank'}, title)

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
      // poor man's way to keep the unlock buttons aligned
      h('div', {
        class: 'authentication-paragraph small',
        dangerouslySetInnerHTML: {__html: '&nbsp;'},
      }),
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
        src: 'assets/ledger_nano_s_x.jpg',
        alt: 'Ledger Nano S/X',
      }),
      h('div', {class: 'authentication-paragraph'}, 'Ledger Nano S/X'),
      h('div', {class: 'authentication-paragraph small'}, 'also with Android device'),
      h(
        'div',
        {class: 'authentication-paragraph small'},
        LedgerAffiliateLink('Support us by buying one')
      ),
      h(
        'button',
        {
          class: 'button primary ledger',
          onClick: () => loadWallet({cryptoProviderType: CRYPTO_PROVIDER_TYPES.LEDGER}),
        },
        'Unlock with'
      )
    )
  )
}

module.exports = LoadByHardwareWalletSection
