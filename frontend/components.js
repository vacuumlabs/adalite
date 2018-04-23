import {h, Component} from 'preact'
import {connect} from 'unistore/preact'
import Cardano from '../wallet/cardano-wallet'
import actions from './actions'
import {RefreshIcon, ExitIcon} from './svg'

import {CARDANOLITE_CONFIG} from './frontendConfigLoader'

class UnlockClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentWalletMnemonicOrSecret:
        'plastic that delay conduct police ticket swim gospel intact harsh obtain entire',
    }
    this.generateMnemonic = this.generateMnemonic.bind(this)
    this.loadWalletFromMnemonic = this.loadWalletFromMnemonic.bind(this)
    this.updateMnemonic = this.updateMnemonic.bind(this)
  }

  generateMnemonic() {
    this.setState({currentWalletMnemonicOrSecret: Cardano.generateMnemonic()})
  }

  loadWalletFromMnemonic() {
    this.props.loadWalletFromMnemonic(this.state.currentWalletMnemonicOrSecret)
  }

  updateMnemonic(e) {
    this.setState({currentWalletMnemonicOrSecret: e.target.value})
  }

  render({loadWalletFromMnemonic}, {currentWalletMnemonicOrSecret}) {
    return h(
      'div',
      {class: 'intro-wrapper'},
      h(
        'div',
        undefined,
        h('h1', {class: 'intro-header fade-in-up'}, 'Load your existing Cardano Wallet'),
        h(
          'div',
          {class: 'intro-input-row fade-in-up-delayed'},
          h('input', {
            type: 'text',
            class: 'styled-input-nodiv styled-unlock-input',
            id: 'mnemonic-submitted',
            name: 'mnemonic-submitted',
            placeholder: 'Enter twelve-word mnemonic',
            value: currentWalletMnemonicOrSecret,
            onInput: this.updateMnemonic,
          }),
          h(
            'span',
            undefined,
            h(
              'button',
              {class: 'intro-button rounded-button', onClick: this.loadWalletFromMnemonic},
              'Go'
            )
          )
        ),
        h(
          'a',
          {class: 'intro-link fade-in-up-delayed', onClick: this.generateMnemonic},
          '…or generate a new one'
        )
      )
    )
  }
}

const Unlock = connect(undefined, actions)(UnlockClass)

const Balance = connect('balance')(({balance}) =>
  h(
    'div',
    {class: 'balance-block'},
    h('h2', undefined, 'Balance'),
    h(
      'p',
      undefined,
      h(
        'span',
        {class: 'balance-value'},
        isNaN(Number(balance)) ? balance : `${balance / 1000000}`
      ),
      h('img', {class: 'ada-sign', src: '/assets/ada.png'})
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
    {class: ''},
    h('h2', undefined, 'Already Used Addresses'),
    ...usedAddresses.map((adr) => Address(adr))
  )
)

const UnusedAddressesList = connect('unusedAddresses', actions)(
  ({unusedAddresses, generateNewUnusedAddress}) => {
    const disableGettingNewAddresses =
      unusedAddresses.length >= CARDANOLITE_CONFIG.CARDANOLITE_ADDRESS_RECOVERY_GAP_LENGTH
    return h(
      'div',
      {class: ''},
      h('h2', undefined, 'Unused Addresses'),
      ...unusedAddresses.map((adr) => Address(adr)),
      h(
        'button',
        {
          disabled: !!disableGettingNewAddresses,
          onClick: generateNewUnusedAddress,
        },
        'Get one more'
      )
    )
  }
)

const Addresses = () =>
  h('div', {class: 'content-wrapper'}, h(UnusedAddressesList), h(UsedAddressesList))

const PrettyDate = ({date}) => {
  const day = `${date.getDate()}`.padStart(2)
  const month = `${date.getMonth() + 1}`.padStart(2)
  const year = date.getFullYear()
  // pad with html space character, since two regular spaces get truncated
  const hours = `${date.getHours()}`.padStart(2, ' ')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${day}.${month}. ${year}  ${hours}:${minutes}`
}

const PrettyValue = ({effect}) => {
  const value = Math.abs(effect / 1000000)
  const prefix = effect > 0 ? '+ ' : '- '
  const number = `${value}`.indexOf('.') === -1 ? `${value}.0` : `${value}`
  return h(
    'pre',
    {style: `color: ${effect > 0 ? 'green' : 'red'}`},
    `${prefix}${number}`.padEnd(10)
  )
}

const TransactionAddress = ({address}) => {
  return h(
    'a',
    {
      class: 'transaction-id',
      href: `https://cardanoexplorer.com/tx/${address}`,
      target: '_blank',
      title: 'Examine via CardanoExplorer.com',
    },
    address
  )
}

const TransactionHistory = connect('transactionHistory')(({transactionHistory}) =>
  h(
    'div',
    {class: ''},
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
            h('td', undefined, h(PrettyDate, {date: new Date(transaction.ctbTimeIssued * 1000)})),
            h('td', undefined, h(TransactionAddress, {address: transaction.ctbId})),
            h('td', undefined, h(PrettyValue, {effect: transaction.effect}))
          )
        )
      )
    )
  )
)

class SendAdaClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      totalAmount: (
        parseFloat(props.sendAmountFieldValue || 0) +
        props.transactionFee / 1000000
      ).toFixed(6),
    }
  }

  componentWillReceiveProps(next) {
    // don't update to invalid value while waiting for fee
    if (next.feeCalculatedFrom === next.sendAmountFieldValue) {
      this.setState({
        totalAmount: (parseFloat(next.sendAmountFieldValue || 0) + next.transactionFee).toFixed(6),
      })
    }
  }

  render(
    {
      sendSuccess,
      sendAddress,
      sendAmountFieldValue,
      feeCalculatedFrom,
      inputAddress,
      inputAmount,
      transactionFee,
      submitTransaction,
      calculateFee,
    },
    {totalAmount}
  ) {
    const feeRecalculating = feeCalculatedFrom !== sendAmountFieldValue
    return h(
      'div',
      {class: 'content-wrapper'},
      h(
        'div',
        undefined,
        h('h2', undefined, 'Send Ada'),
        sendSuccess !== ''
          ? h('span', {id: 'transacton-submitted'}, `Transaction status: ${sendSuccess}`)
          : '',
        h('label', undefined, h('span', undefined, 'Receiving address')),
        h('input', {
          type: 'text',
          id: 'send-address',
          class: 'styled-input-nodiv styled-send-input',
          name: 'send-address',
          placeholder: 'Address',
          size: '28',
          value: sendAddress,
          onInput: inputAddress,
        }),
        h(
          'div',
          {class: 'amount-label-row'},
          h('label', undefined, h('span', undefined, 'Amount')),
          h('span', {class: 'transaction-fee'}, `+ ${transactionFee} transaction fee`)
        ),
        h(
          'div',
          {class: 'styled-input send-input'},
          h('input', {
            type: 'text',
            id: 'send-amount',
            name: 'send-amount',
            placeholder: 'Amount',
            size: '28',
            value: sendAmountFieldValue,
            onInput: inputAmount,
          }),
          h('span', {style: `color: ${feeRecalculating ? 'red' : 'green'}`}, `= ${totalAmount} ADA`)
        ),
        feeRecalculating
          ? h(
            'button',
            {disabled: true, class: 'loading-button'},
            h('div', {class: 'loading-inside-button'}),
            'Calculating Fee'
          )
          : h('button', {onClick: submitTransaction, class: 'loading-button'}, 'Submit')
      )
    )
  }
}

const SendAda = connect(
  (state) => ({
    sendSuccess: state.sendSuccess,
    sendAddress: state.sendAddress,
    sendAmountFieldValue: state.sendAmountFieldValue,
    feeCalculatedFrom: state.feeCalculatedFrom,
    transactionFee: state.transactionFee / 1000000,
  }),
  actions
)(SendAdaClass)

const WalletInfo = () => h('div', {class: 'content-wrapper'}, h(Balance), h(TransactionHistory))

const TopLevelRouter = connect((state) => ({
  pathname: state.router.pathname,
  activeWalletId: state.activeWalletId,
}))(({pathname, activeWalletId}) => {
  // unlock not wrapped in main
  if (!activeWalletId) return h(Unlock)
  const currentTab = pathname.split('/')[1]
  let content
  switch (currentTab) {
    case 'dashboard':
      content = h(WalletInfo)
      break
    case 'receive':
      content = h(Addresses)
      break
    case 'send':
      content = h(SendAda)
      break
    default:
      content = h(WalletInfo)
  }
  // TODO is Alert used anywhere? if so add here
  return h('main', {class: 'main'}, content)
})

const LoginStatus = connect(
  (state) => ({
    pathname: state.router.pathname,
    activeWalletId: state.activeWalletId,
    balance: state.balance,
  }),
  actions
)(({pathname, activeWalletId, balance, reloadWalletInfo, logout}) =>
  h(
    'div',
    {class: 'status'},
    h(
      'div',
      {class: 'status-text-wrapper'},
      h(
        'div',
        {class: 'status-text'},
        'Balance: ',
        h('span', {class: 'status-balance'}, `${(balance / 1000000).toFixed(6)} ADA`)
      ),
      h(
        'div',
        {class: 'status-text', title: activeWalletId},
        'WalletID: ',
        h('span', {class: 'active-wallet-id', title: activeWalletId}, activeWalletId)
      )
    ),
    h(
      'div',
      {class: 'status-button-wrapper'},
      h(
        'button',
        {onClick: reloadWalletInfo},
        h(RefreshIcon),
        h('div', {class: 'status-icon-button-content'}, 'Refresh')
      ),
      h(
        'button',
        {onClick: logout},
        h(ExitIcon),
        h('div', {class: 'status-icon-button-content'}, 'Logout')
      )
    )
  )
)

const NavbarUnauth = () =>
  h(
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
        {class: 'unauth'},
        h('a', {href: 'https://github.com/vacuumlabs/cardano', target: '_blank'}, 'About')
      )
    )
  )

const NavbarAuth = connect((state) => ({
  pathname: state.router.pathname,
  activeWalletId: state.activeWalletId,
}))(({pathname, activeWalletId}) => {
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
        {class: 'title', onClick: () => window.history.pushState({}, 'dashboard', 'dashboard')},
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
          'div',
          undefined,
          h(
            'a',
            {
              class: currentTab === 'dashboard' && 'active',
              onClick: () => pushState({}, 'dashboard', 'dashboard'),
            },
            'Dashboard'
          ),
          h(
            'a',
            {
              class: currentTab === 'send' && 'active',
              onClick: () => pushState({}, 'send', 'send'),
            },
            'Send'
          ),
          h(
            'a',
            {
              class: currentTab === 'receive' && 'active',
              onClick: () => pushState({}, 'receive', 'receive'),
            },
            'Receive'
          )
        ),
        h(LoginStatus)
      )
    )
  )
})

const Navbar = connect((state) => ({
  activeWalletId: state.activeWalletId,
}))(({activeWalletId}) => (activeWalletId ? h(NavbarAuth) : h(NavbarUnauth)))

class AboutOverlayClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dontShowAgainCheckbox: false,
    }
    this.checkboxClick = this.checkboxClick.bind(this)
    this.toggleAboutOverlay = this.toggleAboutOverlay.bind(this)
  }

  checkboxClick() {
    this.setState({dontShowAgainCheckbox: !this.state.dontShowAgainCheckbox})
  }

  toggleAboutOverlay() {
    this.props.toggleAboutOverlay(this.state.dontShowAgainCheckbox)
  }

  render({displayAboutOverlay, toggleAboutOverlay}, {dontShowAgainCheckbox}) {
    return displayAboutOverlay
      ? h(
        'div',
        {class: 'overlay'},
        h('div', {
          class: 'overlay-close-layer',
          onClick: toggleAboutOverlay, // does not allow remembering the checkbox
        }),
        h(
          'div',
          {class: 'box text'},
          h('h4', undefined, ' Disclaimer: CardanoLite is not created by Cardano Foundation. '),
          h(
            'p',
            undefined,
            `The official Cardano team did not review this code and is not responsible for any damage
        it may cause you. The CardanoLite project is in alpha stage and should be used for
        penny-transactions only. We appreciate feedback, especially review of the crypto-related code.`
          ),
          h('h4', {class: 'header-margin'}, ' CardanoLite is not a bank '),
          h(
            'p',
            undefined,
            `
        It does not really store your funds permanently - each
        time you interact with it, you have to insert the mnemonic - the 12-words long root password
        to your account. If you lose it, we cannot help you restore the funds.
      `
          ),
          h('p', undefined, 'Feedback and contributions are very welcome.'),
          h(
            'label',
            {class: 'centered-row'},
            h('input', {
              type: 'checkbox',
              checked: dontShowAgainCheckbox,
              onChange: this.checkboxClick,
              class: 'understand-checkbox',
            }),
            'I understand the risk and do not wish to be shown this screen again'
          ),
          h(
            'span',
            {class: 'centered-row'},
            h(
              'button',
              {
                onClick: this.toggleAboutOverlay,
                class: 'rounded-button',
              },
              'Close'
            )
          )
        )
      )
      : null
  }
}

const AboutOverlay = connect('displayAboutOverlay', actions)(AboutOverlayClass)

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

export const App = () =>
  h('div', {class: 'wrap'}, h(AboutOverlay), h(Loading), h(Navbar), h(TopLevelRouter), h(Footer))
