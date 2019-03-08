const {h} = require('preact')

const LoadByHardwareWalletSection = ({loadWallet}) => {
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
      h('div', {class: 'authentication-paragraph small'}, '(firmware version >= 2.0.8)'),
      h(
        'button',
        {
          class: 'button primary trezor',
          onClick: () => loadWallet({cryptoProvider: 'trezor'}),
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
      h('div', {class: 'authentication-paragraph small'}, 'coming soon'),
      h(
        'button',
        {
          class: 'button grey ledger',
          disabled: true,
        },
        'Unlock with'
      )
    ),
    h(
      'div',
      {class: 'authentication-buttons'},
      h(
        'button',
        {
          class: 'button primary trezor',
          onClick: () => loadWallet({cryptoProvider: 'trezor'}),
        },
        'Unlock with'
      ),
      h(
        'button',
        {
          class: 'button grey ledger',
          disabled: true,
        },
        'Unlock with'
      )
    )
  )
}

module.exports = LoadByHardwareWalletSection
