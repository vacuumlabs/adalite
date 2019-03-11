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
    {class: 'auth-section'},
    h(
      'div',
      undefined,
      'Hardware wallets provide the best security level for storing your cryptocurrencies.'
    ),
    h(
      'div',
      undefined,
      h(
        'div',
        {class: 'margin-top'},
        `AdaLite supports Trezor model T and Ledger Nano S${
          disableLedgerByFlag ? ' (coming soon!)' : '.'
        }`,
        disableLedgerByFlag
          ? undefined
          : h(
            'div',
            {class: 'margin-top'},
            h(
              'a',
              {
                href: 'https://github.com/vacuumlabs/adalite/wiki/Troubleshooting',
                target: 'blank',
              },
              'Trouble connecting?'
            )
          )
      ),
      h(
        'div',
        {class: 'centered-row margin-top'},
        h(
          'button',
          {
            onClick: () => loadWallet({cryptoProviderType: CRYPTO_PROVIDER_TYPES.TREZOR}),
          },
          h(
            'div',
            undefined,
            h('span', undefined, 'use '),
            h('span', {class: 'hw-wallet-btn-text'}, 'TREZOR')
          )
        ),
        h(
          'button',
          {
            onClick: () => loadWallet({cryptoProviderType: CRYPTO_PROVIDER_TYPES.LEDGER}),
            disabled: disableLedger,
          },
          h(
            'div',
            undefined,
            h('span', undefined, 'use '),
            h('span', {class: 'hw-wallet-btn-text'}, 'LEDGER')
          )
        )
      ),
      h(
        'div',
        {class: 'margin-top'},
        'You can support us by purchasing ',
        TrezorAffiliateLink('Trezor'),
        ' or ',
        LedgerAffiliateLink('Ledger'),
        ' using our affiliate links.'
      )
    )
  )
}

module.exports = LoadByHardwareWalletSection
