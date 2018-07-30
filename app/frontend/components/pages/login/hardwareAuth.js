const {h} = require('preact')

const LoadByHardwareWalletSection = ({enableTrezor, loadWallet}) => {
  const TrezorAffiliateLink = (title) =>
    h('a', {href: 'https://shop.trezor.io?a=cardanolite.com', target: 'blank'}, title)

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
        h('div', {class: 'margin-top'}, 'CardanoLite supports Trezor model T.'),
        h(
          'div',
          {class: 'centered-row margin-top'},
          h(
            'button',
            {
              onClick: () => loadWallet({cryptoProvider: 'trezor'}),
            },
            h(
              'div',
              undefined,
              h('span', undefined, 'use '),
              h('span', {class: 'trezor-text'}, 'TREZOR')
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
