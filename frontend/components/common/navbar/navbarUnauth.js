const {h} = require('preact')

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
        h('img', {src: '/assets/logo.png'}),
        h('span', undefined, 'CardanoLite Wallet'),
        h('sup', undefined, '⍺')
      ),
      h(
        'a',
        {
          class: 'unauth-menu',
          href: 'https://github.com/vacuumlabs/cardanolite/wiki/CardanoLite-FAQ',
          target: '_blank',
        },
        'Help'
      )
    )
  )

module.exports = NavbarUnauth
