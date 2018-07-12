const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../actions')
const {RefreshIcon, ExitIcon} = require('../../svg')
const printAda = require('../../printAda')

const LoginStatus = connect(
  (state) => ({
    pathname: state.router.pathname,
    balance: state.balance,
  }),
  actions
)(({balance, reloadWalletInfo, logout}) =>
  h(
    'div',
    {class: 'status'},
    h(
      'div',
      {class: 'status-text on-desktop-only'},
      'Balance: ',
      h('span', {class: 'status-balance'}, printAda(balance)),
      h('img', {class: 'ada-sign', alt: 'ADA', src: '/assets/ada.png'})
    ),
    h(
      'div',
      {class: 'status-button-wrapper'},
      h(
        'label',
        {class: 'inline', for: 'navcollapse'},
        h(
          'div',
          {class: 'button', onClick: reloadWalletInfo},
          h(RefreshIcon),
          h('div', {class: 'status-icon-button-content'}, 'Refresh')
        )
      ),
      h(
        'label',
        {class: 'inline', for: 'navcollapse'},
        h(
          'div',
          {class: 'button', onClick: () => setTimeout(logout, 100)},
          h(ExitIcon),
          h('div', {class: 'status-icon-button-content'}, 'Logout')
        )
      )
    )
  )
)

const NavbarAuth = connect((state) => ({
  pathname: state.router.pathname,
  balance: state.balance,
  isDemoWallet: state.isDemoWallet,
}))(({pathname, balance, isDemoWallet}) => {
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
          onClick: () => window.history.pushState({}, 'dashboard', 'dashboard'),
        },
        h('img', {src: '/assets/logo.png'}),
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
          h('span', {class: 'mobile-balance-label'}, 'Balance: '),
          h('span', {class: 'status-balance'}, printAda(balance)),
          h('img', {class: 'ada-sign', alt: ' ADA', src: '/assets/ada.png'}),
          h(
            'label',
            {class: 'navcollapse-label', for: 'navcollapse'},
            h('a', {class: 'menu-btn'}, ' ')
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
                class: currentTab === 'dashboard' && 'active',
                onClick: () => pushState({}, 'dashboard', 'dashboard'),
              },
              'Dashboard'
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
