const {h} = require('preact')
const APP_VERSION = require('../../../config').ADALITE_CONFIG.ADALITE_APP_VERSION

const NavbarUnauth = () =>
  h(
    'div',
    {class: 'navbar'},
    h(
      'div',
      {class: 'navbar-wrap-unauth'},
      h(
        'a',
        {class: 'title', href: '/'},
        h('img', {src: 'assets/adalite-logo.svg', alt: 'AdaLite - Cardano Wallet'})
      ),
      h('div', {class: 'logo-version-number'}, APP_VERSION),
      h(
        'span',
        undefined,
        h(
          'a',
          {
            class: 'unauth-menu',
            href: 'about',
            target: '_blank',
          },
          'About'
        ),
        h(
          'a',
          {
            class: 'unauth-menu',
            href: 'https://github.com/vacuumlabs/adalite/wiki',
            target: '_blank',
          },
          'Help'
        )
      )
    )
  )

module.exports = NavbarUnauth
