import {h, Component} from 'preact'
import {connect} from 'unistore/preact'
import Cardano from '../wallet/cardano-wallet'
import actions from './actions'
import strings from './translations'
import {RefreshIcon, ExitIcon} from './svg'

import {CARDANOLITE_CONFIG} from './config'

class UnlockClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mnemonic: 'civil void tool perfect avocado sweet immense fluid arrow aerobic boil flash',
    }
    this.generateMnemonic = this.generateMnemonic.bind(this)
    this.loadWalletFromMnemonic = this.loadWalletFromMnemonic.bind(this)
    this.updateMnemonic = this.updateMnemonic.bind(this)
  }

  generateMnemonic() {
    this.setState({
      mnemonic: Cardano.generateMnemonic(),
      validationMsg: undefined,
    })
  }

  async loadWalletFromMnemonic() {
    this.setState({validationMsg: undefined})
    if (!Cardano.validateMnemonic(this.state.mnemonic)) {
      return this.setState({
        validationMsg: 'Invalid mnemonic, check your mnemonic for typos and try again.',
      })
    }
    try {
      return await this.props.loadWalletFromMnemonic(this.state.mnemonic)
    } catch (e) {
      return this.setState({
        validationMsg: `Error during wallet initialization: ${e.toString()}`,
      })
    }
  }

  updateMnemonic(e) {
    this.setState({mnemonic: e.target.value})
  }

  render({loadWalletFromMnemonic}, {mnemonic}) {
    return h(
      'div',
      {class: 'intro-wrapper'},
      h(
        'div',
        undefined,
        h('h1', {class: 'intro-header fade-in-up'}, 'Load your existing Cardano Wallet'),
        this.state.validationMsg ? h('p', {class: 'alert error'}, this.state.validationMsg) : '',
        h(
          'div',
          {class: 'intro-input-row fade-in-up'},
          h('input', {
            type: 'text',
            class: 'styled-input-nodiv styled-unlock-input',
            id: 'mnemonic-submitted',
            name: 'mnemonic-submitted',
            placeholder: 'Enter twelve-word mnemonic',
            value: mnemonic,
            onInput: this.updateMnemonic,
            autocomplete: 'nope',
          }),
          h(
            'span',
            undefined,
            h(
              'button',
              {
                class: 'intro-button rounded-button',
                disabled: !mnemonic,
                onClick: this.loadWalletFromMnemonic,
              },
              'Go'
            )
          )
        ),
        h(
          'a',
          {
            class: 'intro-link fade-in-up',
            onClick: this.generateMnemonic,
          },
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

class Tooltip extends Component {
  constructor(props) {
    super(props)
    this.showTooltip = this.showTooltip.bind(this)
    this.hideTooltip = this.hideTooltip.bind(this)
    this.interval = null
    this.state = {active: false}
  }

  showTooltip(e) {
    this.setState({active: true})
    clearTimeout(this.interval)
    this.interval = setTimeout(() => {
      this.interval = null
      this.hideTooltip()
    }, 2000)
  }

  hideTooltip(e) {
    clearTimeout(this.interval)
    this.interval = null
    this.setState({active: false})
  }

  render({tooltip, children}) {
    return h(
      'span',
      {
        class: ` with-tooltip${this.state.active ? ' active' : ''}`,
        tooltip,
        onMouseEnter: this.showTooltip,
        onMouseLeave: this.hideTooltip,
        onClick: this.showTooltip,
      },
      children
    )
  }
}

class CopyOnClick extends Component {
  constructor(props) {
    super(props)
    this.state = {tooltip: 'Copy to clipboard'}
    this.fallbackCopyTextToClipboard = this.fallbackCopyTextToClipboard.bind(this)
    this.copyTextToClipboard = this.copyTextToClipboard.bind(this)
  }

  fallbackCopyTextToClipboard() {
    const input = document.createElement('textarea')
    input.value = this.props.value
    input.style.zIndex = '-1'
    input.style.position = 'fixed'
    input.style.top = '0'
    input.style.left = '0'
    document.body.appendChild(input)
    input.focus()
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }

  async copyTextToClipboard() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.props.value)
      } else {
        this.fallbackCopyTextToClipboard()
      }
      this.setState({tooltip: 'Copied!'})
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Could not copy text: ', err)
    }
  }

  render({value}, {tooltip}) {
    return h(
      Tooltip,
      {tooltip},
      h(
        'span',
        {
          class: 'copy',
          onClick: this.copyTextToClipboard,
          onMouseEnter: () => this.setState({tooltip: 'Copy to clipboard'}),
        },
        ''
      )
    )
  }
}

const Address = ({address, isTransaction}) =>
  h(
    'div',
    {class: 'address-wrap'},
    h('input', {
      readonly: true,
      type: 'text',
      class: 'address',
      value: address,
    }),
    h(CopyOnClick, {value: address}),
    h(
      Tooltip,
      {tooltip: 'Examine via CardanoExplorer.com'},
      h('a', {
        href: `https://cardanoexplorer.com/${isTransaction ? 'tx' : 'address'}/${address}`,
        target: '_blank',
        class: 'address-link',
      })
    )
  )

const UsedAddressesList = connect('usedAddresses')(({usedAddresses}) =>
  h(
    'div',
    {class: ''},
    h('h2', undefined, 'Already Used Addresses'),
    ...usedAddresses.map((adr) => h(Address, {address: adr}))
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
      ...unusedAddresses.map((adr) => h(Address, {address: adr})),
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

const TransactionAddress = ({address}) =>
  h(
    'a',
    {
      class: 'transaction-id with-tooltip',
      tooltip: 'Examine via CardanoExplorer.com',
      href: `https://cardanoexplorer.com/tx/${address}`,
      target: '_blank',
    },
    address
  )

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
            h(
              'td',
              undefined,
              h(PrettyDate, {
                date: new Date(transaction.ctbTimeIssued * 1000),
              })
            ),
            h('td', undefined, h(TransactionAddress, {address: transaction.ctbId})),
            h('td', undefined, h(PrettyValue, {effect: transaction.effect}))
          )
        )
      )
    )
  )
)

const ConfirmTransactionDialog = connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    sendAmount: state.sendAmountForTransactionFee / 1000000,
    transactionFee: state.transactionFee / 1000000,
  }),
  actions
)(({sendAddress, sendAmount, transactionFee, submitTransaction, cancelTransaction}) => {
  const total = sendAmount + transactionFee
  return h(
    'div',
    {class: 'overlay'},
    h(
      'div',
      {class: 'box'},
      h('h4', undefined, 'Review transaction'),
      h(
        'div',
        {class: 'review-transaction-container'},
        h(
          'div',
          {class: 'review-transaction-row'},
          h(
            'span',
            undefined,
            'Adress: ',
            h('span', {class: 'review-transaction-adress'}, sendAddress)
          )
        ),
        h(
          'div',
          {class: 'review-transaction-row'},
          'Amout: ',
          h('b', undefined, sendAmount.toFixed(6))
        ),
        h(
          'div',
          {class: 'review-transaction-row'},
          'Transaction fee: ',
          h('b', undefined, transactionFee.toFixed(6))
        ),
        h(
          'div',
          {class: 'review-transaction-total-row'},
          h('b', {class: 'review-transaction-total-label'}, 'TOTAL'),
          h('b', {class: 'review-transaction-total'}, total.toFixed(6))
        ),
        h(
          'div',
          {class: ''},
          h('button', {onClick: submitTransaction}, 'Confirm'),
          h('button', {class: 'cancel', onClick: cancelTransaction}, 'Cancel')
        )
      )
    )
  )
})

class SendAdaClass extends Component {
  render({
    sendResponse,
    sendAddress,
    sendAddressValidationError,
    sendAmount,
    sendAmountValidationError,
    updateAddress,
    updateAmount,
    transactionFee,
    confirmTransaction,
    calculateFee,
    balance,
    showConfirmTransactionDialog,
    feeRecalculating,
    totalAmount,
  }) {
    const enableSubmit =
      sendAmount && !sendAmountValidationError && sendAddress && !sendAddressValidationError

    const displayTransactionFee = sendAmount !== '' && transactionFee > 0

    return h(
      'div',
      {class: 'content-wrapper'},
      h(
        'div',
        undefined,
        h('h2', undefined, 'Send Ada'),
        sendResponse !== ''
          ? h(
            'div',
            {
              id: 'transacton-submitted',
              class: `alert ${sendResponse ? 'success' : 'error'}`,
            },
            'Transaction ',
            sendResponse
              ? h('b', undefined, 'successful')
              : h('span', undefined, h('b', undefined, 'failed'), ', please try again.')
          )
          : '',
        h(
          'div',
          {class: 'row'},
          h('label', undefined, h('span', undefined, 'Receiving address')),
          sendAddressValidationError &&
            h('span', {class: 'validationMsg'}, strings[sendAddressValidationError.code]())
        ),
        h('input', {
          type: 'text',
          id: 'send-address',
          class: 'styled-input-nodiv styled-send-input',
          name: 'send-address',
          placeholder: 'Address',
          size: '28',
          value: sendAddress,
          onInput: updateAddress,
          autocomplete: 'nope',
        }),
        h(
          'div',
          {class: 'amount-label-row'},
          h(
            'div',
            {class: 'row'},
            h('label', undefined, h('span', undefined, 'Amount')),
            sendAmountValidationError &&
              h(
                'p',
                {class: 'validationMsg'},
                strings[sendAmountValidationError.code](sendAmountValidationError.params)
              )
          ),
          displayTransactionFee &&
            h('span', {class: 'transaction-fee'}, `+ ${transactionFee} transaction fee`)
        ),
        h(
          'div',
          {class: 'styled-input send-input'},
          h('input', {
            id: 'send-amount',
            name: 'send-amount',
            placeholder: 'Amount',
            size: '28',
            value: sendAmount,
            onInput: updateAmount,
            autocomplete: 'nope',
          }),
          displayTransactionFee &&
            h(
              'span',
              {style: `color: ${feeRecalculating || !enableSubmit ? 'red' : 'green'}`},
              `= ${totalAmount} ADA`
            )
        ),
        feeRecalculating
          ? h(
            'button',
            {disabled: true, class: 'loading-button'},
            h('div', {class: 'loading-inside-button'}),
            'Calculating Fee'
          )
          : h(
            'button',
            {
              disabled: !enableSubmit,
              onClick: confirmTransaction,
              class: 'loading-button',
            },
            'Submit'
          ),
        showConfirmTransactionDialog && h(ConfirmTransactionDialog)
      )
    )
  }
}

const SendAda = connect(
  (state) => ({
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddress.validationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmount.validationError,
    sendAmount: state.sendAmount.fieldValue,
    transactionFee: state.transactionFee / 1000000,
    balance: parseFloat(state.balance) / 1000000,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    feeRecalculating: state.calculatingFee,
    totalAmount: ((state.sendAmountForTransactionFee + state.transactionFee) / 1000000).toFixed(6),
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
    balance: state.balance,
  }),
  actions
)(({pathname, activeWalletId, balance, reloadWalletInfo, logout}) =>
  h(
    'div',
    {class: 'status'},
    h(
      'div',
      {class: 'status-text'},
      'Balance: ',
      h('span', {class: 'status-balance'}, `${(balance / 1000000).toFixed(6)} ADA`)
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
          {class: 'box'},
          h(
            'div',
            {class: 'message'},
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
            h('p', undefined, 'Feedback and contributions are very welcome.')
          ),
          h(
            'div',
            undefined,
            h(
              'label',
              {class: 'centered-row action'},
              h('input', {
                type: 'checkbox',
                checked: dontShowAgainCheckbox,
                onChange: this.checkboxClick,
                class: 'understand-checkbox',
              }),
              'I understand the risk and do not wish to be shown this screen again'
            )
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
        {class: 'overlay ontop'},
        h('div', {class: 'loading'}),
        loadingMessage ? h('p', undefined, loadingMessage) : ''
      )
      : null
)

// eslint-disable-next-line no-unused-vars
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
      'Developed by ',
      h(
        'a',
        {href: 'https://vacuumlabs.com', target: '_blank'},
        h('img', {
          src: '/assets/vacuumlabs-logo-dark.svg',
          class: 'logo',
          alt: 'Vacuumlabs Logo',
        })
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
