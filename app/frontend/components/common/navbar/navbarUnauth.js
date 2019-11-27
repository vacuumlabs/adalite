import {h} from 'preact'
import {connect} from 'unistore/preact'
import actions from '../../../actions'
import {ADALITE_CONFIG} from '../../../config'
import isLeftClick from '../../../helpers/isLeftClick'
const APP_VERSION = ADALITE_CONFIG.ADALITE_APP_VERSION

const NavbarUnauth = connect(
  (state) => ({
    pathname: state.router.pathname,
  }),
  actions
)(({pathname, openGenerateMnemonicDialog, openWelcome}) =>
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
            class: 'navbar-link primary',
            href: '#',
            onClick: (e) => {
              e.preventDefault()
              window.history.pushState({}, 'staking', 'staking')
            },
          },
          'Staking'
        ),
        h(
          'a',
          {
            class: 'navbar-link',
            href: '#',
            onClick: (e) => {
              e.preventDefault()
              openWelcome()
            },
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
        )
      ),
      pathname === '/staking'
        ? h(
          'button',
          {
            class: 'button outline navbar',
            onClick: (e) => {
              e.preventDefault()
              window.history.pushState({}, './', './')
            },
          },
          'Access the Wallet'
        )
        : h(
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

export default NavbarUnauth
