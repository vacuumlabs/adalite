const {h} = require('preact')
const {LEDGER, TREZOR} = require('../../../wallet/constants')

const LoadByHardwareWalletSection = ({enableTrezor, loadWallet}) => {
  const TrezorAffiliateLink = (title) =>
    h('a', {href: 'https://shop.trezor.io/?offer_id=10&aff_id=1071', target: 'blank'}, title)

  const TrezorComingSoon = () =>
    h(
      'div',
      undefined,
      h('div', {class: 'strong margin-top'}, 'Support for Trezor model T coming soon!'),
      h(
        'div',
        {class: 'margin-top'},
        'You can support us by purchasing Trezor using our affiliate ',
        TrezorAffiliateLink('link'),
        '.'
      )
    )

  return h(
    'div',
    {class: 'auth-section'},
    h(
      'div',
      undefined,
      'Hardware wallets provide the best security level for storing your cryptocurrencies.'
    ),
    !enableTrezor
      ? h(TrezorComingSoon)
      : h(
        'div',
        undefined,
        h(
          'div',
          {class: 'margin-top'},
          'AdaLite supports Trezor model T (firmware version >= 2.0.8).'
        ),
        h(
          'div',
          {class: 'centered-row margin-top'},
          h(
            'button',
            {
              onClick: () => loadWallet({cryptoProvider: TREZOR}),
            },
            h(
              'div',
              undefined,
              h('span', undefined, 'use '),
              h('span', {class: 'trezor-text'}, 'TREZOR')
            )
          ),
          h(
            'button',
            {
              onClick: () => loadWallet({cryptoProvider: LEDGER}),
            },
            h(
              'div',
              undefined,
              h('span', undefined, 'use '),
              h('span', {class: 'trezor-text'}, 'LEDGER')
            )
          )
        ),
        h(
          'div',
          {class: 'margin-top'},
          'You can support us by purchasing Trezor using our affiliate ',
          TrezorAffiliateLink('link'),
          '.'
        )
      )
  )
}

module.exports = LoadByHardwareWalletSection
