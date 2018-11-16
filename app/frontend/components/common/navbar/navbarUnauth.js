const {h} = require('preact')
const {AdaLiteLogo} = require('../svg')
const APP_VERSION = require('../../../config').ADALITE_CONFIG.ADALITE_APP_VERSION

const NavbarUnauth = () =>
  h(
    'div',
    {class: 'navbar'},
    h(
      'div',
      {class: 'navbar-wrap-unauth'},
      h('a', {class: 'title', href: '/'}, h(AdaLiteLogo)),
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
            href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ',
            target: '_blank',
          },
          'Help'
        )
      )
    )
  )

module.exports = NavbarUnauth
