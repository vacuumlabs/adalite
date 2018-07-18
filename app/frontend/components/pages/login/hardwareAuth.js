const {h} = require('preact')

const LoadByHardwareWalletSection = ({loadWallet}) =>
  h(
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
      'CardanoLite supports ',
      h('a', {href: 'https://trezor.io/', target: 'blank'}, 'Trezor model T.')
    ),
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
    )
  )

module.exports = LoadByHardwareWalletSection
