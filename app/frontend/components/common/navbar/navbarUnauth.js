const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const APP_VERSION = require('../../../config').ADALITE_CONFIG.ADALITE_APP_VERSION

const isLeftClick = require('../../../helpers/isLeftClick')

const NavbarUnauth = connect(
  null,
  actions
)(() =>
  h(
    'nav',
    {class: 'navbar'},
    h(
      'div',
      {class: 'navbar-wrapper'},
      h(
        'h1',
        {class: 'navbar-heading'},
        h('span', {class: 'navbar-title'}, 'AdaLite - Cardano Wallet'),
        h(
          'a',
          {href: '/'},
          h('img', {
            src: 'assets/adalite-logo.svg',
            alt: 'AdaLite - Cardano Wallet',
            class: 'navbar-logo',
          })
        )
      ),
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
      )
    )
  )
)

module.exports = NavbarUnauth
