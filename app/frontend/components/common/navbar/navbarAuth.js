const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const APP_VERSION = require('../../../config').ADALITE_CONFIG.ADALITE_APP_VERSION

const LoginStatus = connect(
  (state) => ({
    pathname: state.router.pathname,
  }),
  actions
)(({logout}) =>
  h(
    'div',
    {class: 'status'},
    h(
      'label',
      {class: 'inline on-desktop-only', for: 'navcollapse'},
      h(
        'div',
        {class: 'button', onClick: () => setTimeout(logout, 100)},
        h('img', {src: 'assets/exit-icon.svg'}),
        h('div', {class: 'status-icon-button-content'}, 'Logout')
      )
    )
  )
)

const NavbarAuth = connect(
  (state) => ({
    pathname: state.router.pathname,
    isDemoWallet: state.isDemoWallet,
    showExportJsonWalletDialog: state.showExportJsonWalletDialog,
    usingHwWallet: state.usingHwWallet,
  }),
  actions
)(({pathname, isDemoWallet, usingHwWallet, logout}) => {
  const {
    history: {pushState},
  } = window
  const currentTab = pathname.split('/')[1]
  return h(
    'div',
    {class: 'navbar'},
    h(
      'div',
      {class: 'navbar-wrap'},
      h(
        'a',
        {
          class: 'title',
          onClick: () => window.history.pushState({}, 'txHistory', 'txHistory'),
        },
        h('img', {src: 'assets/adalite-logo.svg', alt: 'AdaLite - Cardano Wallet'})
      ),
      isDemoWallet ? h('div', {class: 'public-wallet-badge pulse'}, 'DEMO WALLET') : null,
      h('div', {class: 'logo-version-number'}, APP_VERSION),
      h(
        'div',
        {class: 'on-mobile-only'},
        h(
          'div',
          {class: 'centered-row'},
          h(
            'span',
            {class: 'status'},
            h(
              'div',
              {class: 'button', onClick: () => setTimeout(logout, 100)},
              h('img', {src: 'assets/exit-icon.svg'}),
              h('div', {class: 'status-icon-button-content'}, 'Logout')
            )
          ),
          h(
            'label',
            {class: 'navcollapse-label', for: 'navcollapse'},
            h('a', {class: 'menu-btn'}, h('img', {src: 'assets/menu-icon.svg'}))
          )
        )
      ),
      h('input', {id: 'navcollapse', type: 'checkbox'}),
      h(
        'nav',
        undefined,
        h(
          'div',
          undefined,
          h(
            'label',
            {class: 'inline', for: 'navcollapse'},
            h(
              'a',
              {
                class: currentTab === 'txHistory' && 'active',
                onClick: () => pushState({}, 'txHistory', 'txHistory'),
              },
              'History'
            )
          ),
          h(
            'label',
            {class: 'inline', for: 'navcollapse'},
            h(
              'a',
              {
                class: currentTab === 'send' && 'active',
                onClick: () => pushState({}, 'send', 'send'),
              },
              'Send'
            )
          ),
          h(
            'label',
            {class: 'inline', for: 'navcollapse'},
            h(
              'a',
              {
                class: currentTab === 'receive' && 'active',
                onClick: () => pushState({}, 'receive', 'receive'),
              },
              'Receive'
            )
          ),
          !usingHwWallet &&
            h(
              'label',
              {class: 'inline', for: 'navcollapse'},
              h(
                'a',
                {
                  class: currentTab === 'exportWallet' && 'active',
                  onClick: () => pushState({}, 'exportWallet', 'exportWallet'),
                },
                'Export'
              )
            ),
          h(
            'label',
            {class: 'inline', for: 'navcollapse'},
            h(
              'a',
              {
                href: 'about',
                target: '_blank',
              },
              'About'
            )
          ),
          h(
            'label',
            {class: 'inline', for: 'navcollapse'},
            h(
              'a',
              {
                href: 'https://github.com/vacuumlabs/adalite/wiki',
                target: '_blank',
              },
              'Help'
            )
          )
        ),
        h(LoginStatus)
      )
    )
  )
})

module.exports = NavbarAuth
