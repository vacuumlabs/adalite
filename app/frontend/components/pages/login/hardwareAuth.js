const {h} = require('preact')

const LoadByHardwareWalletSection = ({loadWallet}) => {
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
        onClick: () => loadWallet({cryptoProvider: 'trezor'}),
      },
      'Unlock with'
    )
  )
}

module.exports = LoadByHardwareWalletSection
