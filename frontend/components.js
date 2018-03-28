import {h, Component} from 'preact'
import {connect} from 'unistore/preact'
import Cardano from '../wallet/cardano-wallet'

import actions from './actions'

import {CARDANOLITE_CONFIG} from './frontendConfigLoader'

import linkState from 'linkstate'

class UnlockClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentWalletMnemonicOrSecret:
        'opera jacket raise like injury slogan valid deny someone dove tag weapon',
    }
    this.generateMnemonic = this.generateMnemonic.bind(this)
    this.loadWalletFromMnemonic = this.loadWalletFromMnemonic.bind(this)
  }

  generateMnemonic() {
    this.setState({currentWalletMnemonicOrSecret: Cardano.generateMnemonic()})
  }

  loadWalletFromMnemonic() {
    this.props.loadWalletFromMnemonic(this.state.currentWalletMnemonicOrSecret)
  }

  render({loadWalletFromMnemonic}, {currentWalletMnemonicOrSecret}) {
    return h(
      'div',
      {class: 'box'},
      h('h2', {class: 'label'}, 'Load Wallet'),
      h(
        'label',
        undefined,
        h('span', undefined, 'Mnemonic'),
        h('input', {
          type: 'text',
          id: 'mnemonic-submitted',
          class: 'address',
          name: 'mnemonic-submitted',
          size: '47',
          value: currentWalletMnemonicOrSecret,
          onInput: linkState(this, 'currentWalletMnemonicOrSecret'),
        })
      ),
      h('button', {onClick: this.loadWalletFromMnemonic}, 'Load wallet'),
      h('button', {onClick: this.generateMnemonic}, 'Generate')
    )
  }
}

const Unlock = connect(undefined, actions)(UnlockClass)

const NewMnemonic = connect((state) => state)((state) =>
  h(
    'div',
    {class: 'box'}
    // h('h2', undefined, 'New Wallet Mnemonic'),
    // h('input', {
    //   type: 'text',
    //   class: 'address',
    //   placeholder: "Press 'Generate' to create new mnenomonic",
    //   value: state.newWalletMnemonic,
    // }),
    // h('button', {onClick: generateMnemonic}, 'Generate')
  )
)

const Balance = connect('balance')(({balance}) =>
  h(
    'span',
    undefined,
    h('h3', undefined, 'Balance'),
    h('p', undefined, isNaN(Number(balance)) ? balance : `${balance / 1000000} ADA`)
  )
)

const WalletHeader = connect('activeWalletId', actions)(
  ({activeWalletId, reloadWalletInfo, logout}) =>
    h(
      'div',
      {class: 'box box-info'},
      h('h2', undefined, 'Wallet'),
      h('h3', undefined, 'Active Wallet ID'),
      h('input', {
        readonly: true,
        class: 'address',
        value: activeWalletId || 'error, not initialized',
      }),
      h(Balance),
      h(
        'p',
        undefined,
        h('button', {onClick: reloadWalletInfo}, 'Reload Wallet Info'),
        h('button', {class: 'danger', onClick: logout}, 'Close the wallet')
      )
    )
)

const Address = (adr, isTransaction) =>
  h(
    'div',
    {class: 'address-wrap'},
    h('input', {readonly: true, type: 'text', class: 'address', value: adr}),
    h('a', {
      href: `https://cardanoexplorer.com/${isTransaction ? 'tx' : 'address'}/${adr}`,
      target: '_blank',
      title: 'examine via CardanoExplorer.com',
    })
  )

const UsedAddressesList = connect('usedAddresses')(({usedAddresses}) =>
  h(
    'div',
    {class: 'box'},
    h('h2', undefined, 'Already Used Addresses'),
    ...usedAddresses.map((adr) => Address(adr))
  )
)

const UnusedAddressesList = connect('unusedAddresses')(({unusedAddresses}) =>
  //const disableGettingNewAddresses =
  //state.unusedAddresses.length >= CARDANOLITE_CONFIG.CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH
  h(
    'div',
    {class: 'box'},
    h('h2', undefined, 'Unused Addresses'),
    ...unusedAddresses.map((adr) => Address(adr))
  )
)

const TransactionHistory = connect('transactionHistory')(({transactionHistory}) =>
  h(
    'div',
    {class: 'box'},
    h('h2', undefined, 'Transaction History'),
    h(
      'table',
      undefined,
      h(
        'thead',
        undefined,
        h(
          'tr',
          undefined,
          h('th', undefined, 'Time'),
          h('th', undefined, 'Transaction'),
          h('th', undefined, 'Movement (ADA)')
        )
      ),
      h(
        'tbody',
        undefined,
        ...transactionHistory.map((transaction) =>
          h(
            'tr',
            undefined,
            h('td', undefined, new Date(transaction.ctbTimeIssued * 1000).toLocaleString()),
            h('td', undefined, Address(transaction.ctbId, true)),
            h(
              'td',
              undefined,
              h(
                'pre',
                undefined,
                `${transaction.effect > 0 ? '+' : ''}${transaction.effect / 1000000}`
              )
            )
          )
        )
      )
    )
  )
)

// const Fee = connect(state => state)((state) =>
//   h('button', {onClick="${executeAction(
//     calculateFee,
//     "document.getElementById('send-address').value",
//     "parseFloat(document.getElementById('send-amount').value) * 1000000"
//   )}">Calculate Fee</button>
//     h('div', {style: "${!state.fee && 'display: none'}">
//       h('h3', undefined, 'Fee'),
//       ${isNaN(Number(state.fee)) ? state.fee : `<span id="fee">${state.fee / 1000000}</span> ADA`}
//     </div>
// </span>`

const SendAda = connect(['sendSuccess', 'sendAddress', 'sendAmount'])(
  ({sendSuccess, sendAddress, sendAmount}) =>
    h(
      'div',
      {class: 'box'},
      h('h2', undefined, 'Send Ada'),
      sendSuccess !== ''
        ? h('span', {id: 'transacton-submitted'}, `Transaction status: ${sendSuccess}`)
        : '',
      h('label', undefined, h('span', undefined, 'Address')),
      h('input', {
        type: 'text',
        id: 'send-address',
        class: 'address',
        name: 'send-address',
        size: '110',
        value: sendAddress,
      }),
      h(
        'label',
        undefined,
        h('span', undefined, 'Amount'),
        h('input', {
          type: 'number',
          id: 'send-amount',
          name: 'send-amount',
          size: '8',
          step: '0.5',
          min: '0.000001',
          value: sendAmount / 1000000.0,
        }),
        h('span', undefined, 'ADA')
      )
    )
)
// h('p', undefined,
// h('button', {onclick="${executeAction(
//   submitTransaction,
//   "document.getElementById('send-address').value",
//   "parseFloat(document.getElementById('send-amount').value)"
// )}">Send Ada</button>
// ${Fee(state)}
// </p>

const WalletInfo = () =>
  h(
    'div',
    undefined,
    h(WalletHeader),
    h(UnusedAddressesList),
    h(UsedAddressesList),
    h(TransactionHistory)
  )

const SendAdaScreen = () => h('div', undefined, h(WalletHeader), h(SendAda))

const Index = connect((state) => ({
  pathname: state.router.pathname,
  activeWalletId: state.activeWalletId,
}))(({pathname, activeWalletId}) => {
  const currentTab = pathname.split('/')[1]
  switch (currentTab) {
    case 'new-wallet':
      return h(NewMnemonic)
    case 'wallet-info':
      return activeWalletId ? h(WalletInfo) : h(Unlock)
    case 'send-ada':
      return activeWalletId ? h(SendAdaScreen) : h(Unlock)
    default:
      return activeWalletId ? h(WalletInfo) : h(Unlock)
  }
})

const Navbar = connect((state) => ({
  pathname: state.router.pathname,
  activeWalletId: state.activeWalletId,
}))(({pathname}) => {
  const {history: {pushState}} = window
  const currentTab = pathname.split('/')[1]
  return h(
    'div',
    {class: 'navbar'},
    h(
      'div',
      {class: 'navbar-wrap'},
      h(
        'a',
        {class: 'title', href: '/'},
        h('img', {src: '/assets/logo.png'}),
        h('span', undefined, 'CardanoLite Wallet'),
        h('sup', undefined, '⍺')
      ),
      h('label', {class: 'navcollapse-label', for: 'navcollapse'}, 'Menu'),
      h('input', {id: 'navcollapse', type: 'checkbox'}),
      h(
        'nav',
        undefined,
        h(
          'a',
          {
            class: currentTab === 'new-wallet' && 'active',
            onClick: () => pushState({}, 'new-wallet', 'new-wallet'),
          },
          'New Wallet'
        ),
        h(
          'a',
          {
            class: currentTab === 'wallet-info' && 'active',
            onClick: () => pushState({}, 'wallet-info', 'wallet-info'),
          },
          'Wallet Info'
        ),
        h(
          'a',
          {
            class: currentTab === 'send-ada' && 'active',
            onClick: () => pushState({}, 'send-ada', 'send-ada'),
          },
          'Send Ada'
        ),
        h('a', {href: 'https://github.com/vacuumlabs/cardano', target: '_blank'}, 'About')
      )
    )
  )
})

const AboutOverlay = connect('displayAboutOverlay', actions)(
  ({displayAboutOverlay, toggleAboutOverlay}) =>
    displayAboutOverlay
      ? h(
        'div',
        {class: 'overlay'},
        h('div', {
          class: 'overlay-close-layer',
          onClick: () => toggleAboutOverlay(),
        }),
        h(
          'div',
          {class: 'box text'},
          h('h2', undefined, ' Disclaimer: CardanoLite is not created by Cardano Foundation. '),
          h(
            'p',
            undefined,
            `The official Cardano team did not review this code and is not responsible for any damage
          it may cause you. The CardanoLite project is in alpha stage and should be used for
          penny-transactions only. We appreciate feedback, especially review of the crypto-related code.`
          ),
          h('h2', undefined, ' CardanoLite is not a bank '),
          h(
            'p',
            undefined,
            `
          It does not really store your funds permanently - each
          time you interact with it, you have to insert the mnemonic - the 12-words long root password
          to your account. If you lose it, we cannot help you restore the funds.
        `
          ),
          h('p', undefined, 'Feedback and contributions are very welcome.')
        )
      )
      : null
)

const Loading = connect(['loadingMessage', 'loading'])(
  ({loading, loadingMessage}) =>
    loading
      ? h(
        'div',
        {class: 'overlay'},
        h('div', {class: 'loading'}),
        loadingMessage ? h('p', undefined, loadingMessage) : ''
      )
      : null
)

const Alert = connect('alert')(
  ({alert: {show, type, title, hint}}) =>
    show
      ? h(
        'div',
        {class: `alert ${type}`},
        title ? h('p', undefined, title) : '',
        hint ? h('p', undefined, h('small', undefined, hint)) : ''
      )
      : null
)

const Footer = () =>
  h(
    'footer',
    {class: 'footer'},
    h(
      'p',
      undefined,
      'Powered with 🚀 tech in',
      h(
        'a',
        {href: 'https://vacuumlabs.com', target: '_blank'},
        h('img', {src: '/assets/vacuumlabs-logo-dark.svg', class: 'logo', alt: 'Vacuumlabs Logo'})
      )
    ),
    h(
      'p',
      undefined,
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'https://github.com/vacuumlabs/cardano', target: '_blank'}, 'View on Github')
      ),
      '/',
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'mailto:cardanolite@vacuumlabs.com'}, 'Contact us')
      ),
      '/',
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'https://twitter.com/hashtag/cardanolite'}, '#cardanolite')
      )
    )
  )

export const TopLevelRouter = () =>
  h(
    'div',
    {class: 'wrap'},
    h(AboutOverlay),
    h(Loading),
    h(Navbar),
    h('main', {class: 'main'}, h(Alert), h(Index)),
    h(Footer)
  )
