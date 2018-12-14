const {h} = require('preact')
const APP_VERSION = require('../../../config').ADALITE_CONFIG.ADALITE_APP_VERSION
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const isLeftClick = require('../../../helpers/isLeftClick')

const NavbarUnauth = connect(
  null,
  actions
)(({openGenerateMnemonicDialog}) =>
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
            href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ',
            target: '_blank',
          },
          'Help'
        ),
        h(
          'button',
          {
            class: 'demo-button rounded-button',
            /*
            * onMouseDown to prevent onBlur before handling the click event
            * https://stackoverflow.com/questions/17769005/onclick-and-onblur-ordering-issue
            */
            onMouseDown: (e) => isLeftClick(e, openGenerateMnemonicDialog),
          },
          'Create new wallet'
        )
      )
    )
  )
)

module.exports = NavbarUnauth
