const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const {ExitIcon, CardanoLiteLogo, MenuIcon} = require('../svg')

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
        h(ExitIcon),
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
    usingTrezor: state.usingTrezor,
  }),
  actions
)(({pathname, isDemoWallet, usingTrezor, logout}) => {
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
        h(CardanoLiteLogo),
        h('span', undefined, 'CardanoLite'),

        h('sup', undefined, '⍺')
      ),
      isDemoWallet ? h('div', {class: 'public-wallet-badge pulse'}, 'DEMO WALLET') : null,
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
              h(ExitIcon),
              h('div', {class: 'status-icon-button-content'}, 'Logout')
            )
          ),
          h(
            'label',
            {class: 'navcollapse-label', for: 'navcollapse'},
            h('a', {class: 'menu-btn'}, h(MenuIcon))
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
          !usingTrezor &&
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
                href: 'https://github.com/vacuumlabs/cardanolite/wiki/CardanoLite-FAQ',
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
