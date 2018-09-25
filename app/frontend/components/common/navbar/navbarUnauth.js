const {h} = require('preact')
const {AdaLiteLogo} = require('../svg')

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
        h(AdaLiteLogo),
        h('span', undefined, 'AdaLite Wallet'),
        h('sup', undefined, '⍺')
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

module.exports = NavbarUnauth
