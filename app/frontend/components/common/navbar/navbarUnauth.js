const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const isLeftClick = require('../../../helpers/isLeftClick')

const NavbarUnauth = connect(
  null,
  actions
)(({openGenerateMnemonicDialog}) =>
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
          {class: 'navbar-logo', href: '/'},
          h('img', {
            src: 'assets/adalite-logo.svg',
            alt: 'AdaLite - Cardano Wallet',
          })
        )
      ),
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
            href: 'https://github.com/vacuumlabs/adalite/wiki',
            target: '_blank',
            rel: 'noopener',
          },
          'Help'
        ),
        h(
          'button',
          {
            class: 'button outline navbar',
            /*
            * onMouseDown to prevent onBlur before handling the click event
            * https://stackoverflow.com/questions/17769005/onclick-and-onblur-ordering-issue
            */
            onMouseDown: (e) => isLeftClick(e, openGenerateMnemonicDialog),
          },
          'Create New Wallet'
        )
      )
    )
  )
)

module.exports = NavbarUnauth
