const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const APP_VERSION = require('../../../config').ADALITE_CONFIG.ADALITE_APP_VERSION

const NavbarAuth = connect(
  (state) => ({
    isDemoWallet: state.isDemoWallet,
    showExportJsonWalletDialog: state.showExportJsonWalletDialog,
    usingTrezor: state.usingTrezor,
  }),
  actions
)(({isDemoWallet, usingTrezor, logout}) => {
  const {
    history: {pushState},
  } = window
  return h(
    'nav',
    {class: `navbar ${isDemoWallet ? 'demo' : ''}`},
    h(
      'div',
      {class: 'navbar-wrapper'},
      h(
        'h1',
        {class: 'navbar-heading'},
        h('span', {class: 'navbar-title'}, 'AdaLite - Cardano Wallet'),
        h(
          'a',
          {
            class: 'navbar-logo',
            href: '/',
            onClick: () => window.history.pushState({}, 'txHistory', 'txHistory'),
          },
          h('img', {
            src: 'assets/adalite-logo.svg',
            alt: 'AdaLite - Cardano Wallet',
          })
        )
      ),
      isDemoWallet && h('div', {class: 'navbar-demo'}, 'Accessing demo wallet'),
      h('div', {class: 'navbar-version'}, `Ver. ${APP_VERSION}`),
      h(
        'div',
        {class: 'navbar-content'},
        h(
          'a',
          {
            class: 'navbar-link',
            href: 'about',
            target: '_blank',
            rel: 'noopener',
          },
          'About'
        ),
        h(
          'a',
          {
            class: 'navbar-link',
            href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ',
            target: '_blank',
            rel: 'noopener',
          },
          'Help'
        ),
        h(
          'button',
          {
            class: 'button logout',
            onClick: () => setTimeout(logout, 100),
          },
          'Logout'
        )
      )
    )
  )
})

module.exports = NavbarAuth
