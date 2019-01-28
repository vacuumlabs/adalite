const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const APP_VERSION = require('../../../config').ADALITE_CONFIG.ADALITE_APP_VERSION

const NavbarAuth = connect(
  (state) => ({
    isDemoWallet: state.isDemoWallet,
  }),
  actions
)(({isDemoWallet, logout}) => {
  return h(
    'nav',
    {class: `navbar authed ${isDemoWallet ? 'demo' : ''}`},
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
            href: '#',
            onClick: (e) => {
              e.preventDefault()
              window.history.pushState({}, 'txHistory', 'txHistory')
            },
          },
          h('img', {
            src: 'assets/adalite-logo.svg',
            alt: 'AdaLite - Cardano Wallet',
            class: 'navbar-logo',
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
        )
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
})

module.exports = NavbarAuth
