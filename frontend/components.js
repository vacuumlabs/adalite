const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('./actions')
const translations = require('./translations')
const {RefreshIcon, ExitIcon} = require('./svg')
const printAda = require('./printAda')
const {importWalletSecret, isWalletExportEncrypted} = require('../wallet/keypass-json')

class LoadKeyFileClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileName: ' ',
      keyFile: undefined,
    }
    this.selectFile = this.selectFile.bind(this)
    this.readFile = this.readFile.bind(this)
    this.dragOver = this.dragOver.bind(this)
    this.drop = this.drop.bind(this)
    this.unlockKeyfile = this.unlockKeyfile.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
    this.closePasswordModal = this.closePasswordModal.bind(this)
  }

  closePasswordModal() {
    this.setState({encrypted: undefined, error: undefined})
  }

  updatePassword(e) {
    this.setState({password: e.target.value})
  }

  async unlockKeyfile() {
    this.props.loadingAction('Unlocking key file')

    try {
      const secret = (await importWalletSecret(this.state.keyFile, this.state.password)).toString(
        'hex'
      )
      this.setState({error: undefined})
      this.props.loadWallet({cryptoProvider: 'mnemonic', secret})
    } catch (e) {
      this.props.stopLoadingAction()
      this.setState({error: 'Wrong password'})
    }
  }

  selectFile(e) {
    this.props.loadingAction('Reading file')
    const file = e.target.files[0]
    e.target.value = null
    this.readFile(file)
  }

  drop(e) {
    e.stopPropagation()
    e.preventDefault()
    this.props.loadingAction('Reading file')
    const file = e.dataTransfer.files[0]
    this.readFile(file)
  }

  dragOver(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  async readFile(file) {
    this.setState({
      fileName: file.name,
      keyFile: undefined,
      error: undefined,
    })

    const reader = new FileReader()
    await reader.readAsText(file)

    reader.onload = ((theFile) => {
      return async (e) => {
        try {
          const walletExport = await JSON.parse(e.target.result)
          if (await isWalletExportEncrypted(walletExport)) {
            this.setState({
              keyFile: walletExport,
            })
            this.props.stopLoadingAction()
            this.setState({
              encrypted: true,
              password: '',
            })
          } else {
            this.props.loadingAction('Reading key file')
            const secret = (await importWalletSecret(walletExport, '')).toString('hex')
            this.props.loadWallet({cryptoProvider: 'mnemonic', secret})
            this.setState({error: undefined})
          }
        } catch (err) {
          console.error(`Key file parsing failure: ${err}`)
          this.props.stopLoadingAction()
          this.setState({
            error: 'Key File parsing failure!',
          })
        }
        return true
      }
    })(file)
  }

  render({loadingAction}, {fileName, error, encrypted, password}) {
    return h(
      'div',
      undefined,
      h(
        'div',
        {class: 'load-file-row'},
        h(
          'div',
          {
            class: 'drop-area',
            onDragOver: this.dragOver,
            onDrop: this.drop,
          },
          h('b', {class: 'centered-row margin-1rem'}, 'Drop a key file here'),
          h('div', {class: 'centered-row'}, fileName),
          h(
            'div',
            {class: 'centered-row margin-top'},
            h(
              'div',
              undefined,
              h('input', {
                class: 'display-none',
                type: 'file',
                id: 'loadFile',
                accept: 'application/json,.json',
                multiple: false,
                onChange: this.selectFile,
              }),
              h(
                'label',
                {class: 'button-like', for: 'loadFile'},
                h('div', undefined, 'Select key File')
              )
            )
          )
        )
      ),
      encrypted &&
        h(
          'div',
          {class: 'overlay fade-in-up'},
          !this.state.showVerification &&
            h('div', {
              class: 'overlay-close-layer',
              onClick: this.closePasswordModal,
            }),
          h(
            'div',
            {class: 'box box-auto'},
            h(
              'span',
              {
                class: 'overlay-close-button',
                onClick: this.closePasswordModal,
              },
              ''
            ),
            h(
              'div',
              {class: 'margin-1rem'},
              h('h4', undefined, 'Enter password:'),
              h(
                'div',
                {class: 'intro-input-row margin-top'},
                h('input', {
                  type: 'password',
                  class: 'styled-input-nodiv styled-unlock-input',
                  id: 'keyfile-password',
                  name: 'keyfile-password',
                  placeholder: 'Enter key file password',
                  value: password,
                  onInput: this.updatePassword,
                  autocomplete: 'nope',
                }),
                h(
                  'button',
                  {
                    disabled: !password,
                    onClick: this.unlockKeyfile,
                  },
                  'Unlock'
                )
              ),
              error && h('div', {class: 'alert error key-file-error'}, error)
            )
          )
        ),
      error && h('div', {class: 'alert error key-file-error'}, error)
    )
  }
}

const LoadKeyFile = connect(undefined, actions)(LoadKeyFileClass)

const GenerateMnemonicDialog = connect(
  (state) => ({
    mnemonic: state.mnemonic,
  }),
  actions
)(({confirmGenerateMnemonicDialog, mnemonic, closeGenerateMnemonicDialog}) => {
  return h(
    'div',
    {class: 'overlay'},
    h(
      'div',
      {class: 'mnemonic-box-header box center fade-in-up'},
      h(
        'span',
        {
          class: 'overlay-close-button',
          onClick: closeGenerateMnemonicDialog,
        },
        ''
      ),
      h('h4', undefined, 'Generate a Mnemonic Phrase'),
      h(
        'h7',
        undefined,
        'Write these words down. Do not copy them to your clipboard or save them anywhere online.'
      ),
      h('div', {class: 'gray-row mnemonic-box no-events no-select'}, mnemonic),
      h('div', {class: ''}, h('button', {onClick: confirmGenerateMnemonicDialog}, 'Confirm'))
    )
  )
})

class UnlockClass extends Component {
  render({
    mnemonic,
    mnemonicValidationError,
    loadWallet,
    walletLoadingError,
    loadDemoWallet,
    updateMnemonic,
    authMethod,
    openGenerateMnemonicDialog,
    showMnemonicValidationError,
    showGenerateMnemonicDialog,
    checkForMnemonicValidationError,
    setAuthMethod,
  }) {
    const authOption = (name, text) =>
      h(
        'li',
        {
          class: authMethod === name && 'selected',
          onClick: () => setAuthMethod(name),
        },
        text
      )

    const LoadByMenmonicSection = () =>
      h(
        'div',
        {class: 'auth-section'},
        mnemonicValidationError &&
          showMnemonicValidationError &&
          h('p', {class: 'alert error'}, translations[mnemonicValidationError.code]()),
        h(
          'div',
          {class: 'intro-input-row'},
          h('input', {
            type: 'text',
            class: 'styled-input-nodiv styled-unlock-input',
            id: 'mnemonic-submitted',
            name: 'mnemonic-submitted',
            placeholder: 'Enter twelve-word mnemonic',
            value: mnemonic,
            onInput: updateMnemonic,
            onBlur: checkForMnemonicValidationError,
            autocomplete: 'nope',
          }),
          h(
            'span',
            undefined,
            h(
              'button',
              {
                class: `intro-button rounded-button ${
                  mnemonic && !mnemonicValidationError ? 'pulse' : ''
                }`,
                disabled: !mnemonic || mnemonicValidationError,
                onClick: () => loadWallet({cryptoProvider: 'mnemonic', secret: mnemonic}),
              },
              'Go'
            )
          )
        ),
        h(
          'a',
          {
            class: 'intro-link fade-in-up',
            onClick: openGenerateMnemonicDialog,
          },
          '…or generate a new one'
        ),
        showGenerateMnemonicDialog && h(GenerateMnemonicDialog),
        h(
          'div',
          {class: 'centered-row'},
          h(
            'button',
            {
              class: 'demo-button rounded-button',
              onClick: loadDemoWallet,
            },
            'Try demo wallet'
          )
        )
      )

    const LoadByHardwareWalletSection = () =>
      h(
        'div',
        {class: 'auth-section'},
        h(
          'div',
          undefined,
          'Hardware wallets provide the best security level for storing your cryptocurrencies.'
        ),
        h(
          'div',
          undefined,
          'CardanoLite supports ',
          h('a', {href: 'https://trezor.io/', target: 'blank'}, 'Trezor model T.')
        ),
        h(
          'div',
          {class: 'centered-row margin-top'},
          h(
            'button',
            {
              onClick: () => loadWallet({cryptoProvider: 'trezor'}),
            },
            h(
              'div',
              undefined,
              h('span', undefined, 'use '),
              h('span', {class: 'trezor-text'}, 'TREZOR')
            )
          )
        )
      )

    const LoadByFileSection = () => h('div', {class: 'auth-section'}, h(LoadKeyFile))

    return h(
      'div',
      {class: 'intro-wrapper'},
      h(
        'div',
        undefined,
        h('h1', {class: 'intro-header fade-in-up'}, 'Access Cardano Wallet via'),
        h(
          'ul',
          {class: 'tab-row'},
          authOption('mnemonic', 'Mnemonic'),
          authOption('trezor', 'Hardware wallet'),
          authOption('file', 'Key file')
        ),
        walletLoadingError &&
          h(
            'p',
            {class: 'alert error'},
            translations[walletLoadingError.code](walletLoadingError.params)
          ),
        authMethod === 'mnemonic' && LoadByMenmonicSection(),
        authMethod === 'trezor' && LoadByHardwareWalletSection(),
        authMethod === 'file' && LoadByFileSection()
      )
    )
  }
}

const Unlock = connect(
  (state) => ({
    mnemonic: state.mnemonic,
    mnemonicValidationError: state.mnemonicValidationError,
    showMnemonicValidationError: state.showMnemonicValidationError,
    showGenerateMnemonicDialog: state.showGenerateMnemonicDialog,
    walletLoadingError: state.walletLoadingError,
    authMethod: state.authMethod,
  }),
  actions
)(UnlockClass)

const Balance = connect('balance')(({balance}) =>
  h(
    'div',
    {class: 'balance-block'},
    h('h2', undefined, 'Balance'),
    h(
      'p',
      {class: 'balance-value'},
      h('span', undefined, isNaN(Number(balance)) ? balance : `${printAda(balance)}`),
      h('img', {class: 'ada-sign-big', alt: 'ADA', src: '/assets/ada.png'})
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
        class: `with-tooltip ${this.state.active ? 'active' : ''}`,
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

  async copyTextToClipboard(e) {
    e.preventDefault()
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
      h('a', {
        class: 'copy margin-1rem',
        onClick: this.copyTextToClipboard,
        onMouseEnter: () => this.setState({tooltip: 'Copy to clipboard'}),
      })
    )
  }
}

const Address = connect({}, actions)(({address, bip32path, openAddressDetail}) =>
  h(
    'div',
    {class: 'address-wrap'},
    h('b', {class: 'address address-start no-events'}, `/${bip32path.split('/')[5]}`),
    h(
      'span',
      {class: 'address shrinked no-events'},
      h('span', {class: 'shrinklable'}, address.substr(0, address.length - 8))
    ),
    h('span', {class: 'address address-end no-events'}, address.substr(address.length - 10)),
    h(
      Tooltip,
      {tooltip: 'Show\u00A0full\u00A0address'},
      h('a', {
        class: 'show-address-detail margin-top-s',
        onClick: () => openAddressDetail({address, bip32path}),
      })
    )
  )
)

const AddressDetail = connect(
  (state) => ({
    showDetail: state.showAddressDetail,
    showVerification: state.showAddressVerification,
    error: state.addressVerificationError,
  }),
  actions
)(
  ({showDetail, showVerification, error, closeAddressDetail}) =>
    showDetail &&
    h(
      'div',
      {class: 'overlay fade-in-up'},
      !showVerification &&
        h('div', {
          class: 'overlay-close-layer',
          onClick: closeAddressDetail,
        }),
      h(
        'div',
        {class: 'box'},
        h(
          'span',
          {
            class: 'overlay-close-button',
            onClick: closeAddressDetail,
          },
          ''
        ),
        h(
          'div',
          undefined,
          h('b', undefined, 'Address:'),
          h(
            'div',
            {class: 'full-address-row'},
            h(
              'span',
              {
                class: `full-address ${showVerification ? 'no-select' : 'selectable'}`,
              },
              showDetail.address
            )
          ),
          showVerification
            ? h(
              'div',
              undefined,
              h('b', undefined, 'Derivation path:'),
              h(
                'div',
                {class: 'full-address-row'},
                h('span', {class: 'full-address'}, showDetail.bip32path)
              ),
              h(
                'b',
                undefined,
                'Verify that the address and derivation path shown on Trezor matches!'
              )
            )
            : h(
              'div',
              undefined,
              h(
                'div',
                {class: 'centered-row'},
                h(CopyOnClick, {value: showDetail.address}),
                h(
                  Tooltip,
                  {tooltip: 'Examine via CardanoExplorer.com'},
                  h('a', {
                    href: `https://cardanoexplorer.com/address/${showDetail.address}`,
                    target: '_blank',
                    class: 'address-link margin-1rem',
                  })
                )
              )
            )
        )
      )
    )
)

const OwnAddressesList = connect('ownAddressesWithMeta')(({ownAddressesWithMeta}) =>
  h(
    'div',
    {class: 'no-select'},
    h('h2', undefined, 'My Addresses'),
    ...ownAddressesWithMeta.map((adr) =>
      h(Address, {address: adr.address, bip32path: adr.bip32StringPath})
    ),
    h(AddressDetail)
  )
)

const Addresses = () => h('div', {class: 'content-wrapper'}, h(OwnAddressesList))

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
  const value = printAda(Math.abs(effect))
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
      'div',
      {class: 'transaction-history-wrapper'},
      h(
        'table',
        {undefined},
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
)

const ConfirmTransactionDialog = connect(
  (state) => ({
    sendAddress: state.sendAddress.fieldValue,
    sendAmount: state.sendAmountForTransactionFee,
    transactionFee: state.transactionFee,
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
        h('div', {class: 'review-transaction-row'}, h('span', undefined, 'Adress: ')),
        h(
          'div',
          {class: 'review-transaction-row'},
          h('span', {class: 'full-address'}, sendAddress)
        ),
        h(
          'div',
          {class: 'review-transaction-row'},
          'Amout: ',
          h('b', undefined, printAda(sendAmount))
        ),
        h(
          'div',
          {class: 'review-transaction-row'},
          'Transaction fee: ',
          h('b', undefined, printAda(transactionFee))
        ),
        h(
          'div',
          {class: 'review-transaction-total-row'},
          h('b', {class: 'review-transaction-total-label'}, 'TOTAL (ADA)'),
          h('b', {class: 'review-transaction-total'}, printAda(total))
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

const DemoWalletWarningDialog = connect({}, actions)(({closeDemoWalletWarningDialog}) => {
  return h(
    'div',
    {class: 'overlay'},
    h(
      'div',
      {class: 'box center fade-in-up'},
      h('h4', undefined, 'Warning'),
      h(
        'p',
        undefined,
        'You are logged into the demo wallet which is publicly available. Do NOT use this wallet to store funds!'
      ),
      h(
        'div',
        {class: 'box-button-wrapper'},
        h('button', {onClick: closeDemoWalletWarningDialog}, 'I understand')
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
    showConfirmTransactionDialog,
    feeRecalculating,
    totalAmount,
  }) {
    const enableSubmit =
      sendAmount && !sendAmountValidationError && sendAddress && !sendAddressValidationError

    const displayTransactionFee =
      sendAmount !== '' &&
      transactionFee > 0 &&
      !feeRecalculating &&
      (!sendAmountValidationError ||
        sendAmountValidationError.code === 'SendAmountInsufficientFunds')

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
              class: `alert ${sendResponse.success ? 'success' : 'error'}`,
            },
            'Transaction ',
            sendResponse.success
              ? h('b', undefined, 'successful')
              : h(
                'span',
                undefined,
                h('b', undefined, 'failed'),
                `: ${translations[sendResponse.error]()}`
              )
          )
          : '',
        h(
          'div',
          {class: 'row'},
          h('label', undefined, h('span', undefined, 'Receiving address')),
          sendAddressValidationError &&
            h('span', {class: 'validationMsg'}, translations[sendAddressValidationError.code]())
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
          h('div', {class: 'row'}, h('label', undefined, h('span', undefined, 'Amount'))),
          displayTransactionFee &&
            h('span', {class: 'transaction-fee'}, `+ ${printAda(transactionFee)} tx fee`)
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
              `= ${printAda(totalAmount)} ADA`
            )
        ),
        sendAmountValidationError &&
          h(
            'p',
            {class: 'validationMsg send-amount-validation-error'},
            translations[sendAmountValidationError.code](sendAmountValidationError.params)
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
    transactionFee: state.transactionFee,
    showConfirmTransactionDialog: state.showConfirmTransactionDialog,
    feeRecalculating: state.calculatingFee,
    totalAmount: state.sendAmountForTransactionFee + state.transactionFee,
  }),
  actions
)(SendAdaClass)

const WalletInfo = () => h('div', {class: 'content-wrapper'}, h(Balance), h(TransactionHistory))

const TopLevelRouter = connect((state) => ({
  pathname: state.router.pathname,
  walletIsLoaded: state.walletIsLoaded,
  showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
}))(({pathname, walletIsLoaded, showDemoWalletWarningDialog}) => {
  // unlock not wrapped in main
  if (!walletIsLoaded) return h(Unlock)
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
  return h(
    'main',
    {class: 'main'},
    content,
    showDemoWalletWarningDialog ? h(DemoWalletWarningDialog) : null
  )
})

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

const NavbarUnauth = () =>
  h(
    'div',
    {class: 'navbar'},
    h(
      'div',
      {class: 'navbar-wrap-unauth'},
      h(
        'a',
        {class: 'title', href: '/'},
        h('img', {src: '/assets/logo.png'}),
        h('span', undefined, 'CardanoLite Wallet'),
        h('sup', undefined, '⍺')
      ),
      h(
        'a',
        {
          class: 'unauth-menu',
          href: 'https://github.com/vacuumlabs/cardanolite/wiki/CardanoLite-FAQ',
          target: '_blank',
        },
        'Help'
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

const Navbar = connect((state) => ({
  walletIsLoaded: state.walletIsLoaded,
}))(({walletIsLoaded}) => (walletIsLoaded ? h(NavbarAuth) : h(NavbarUnauth)))

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
        h(
          'a',
          {href: 'https://github.com/vacuumlabs/cardanolite', target: '_blank'},
          'View on Github'
        )
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

const App = () =>
  h('div', {class: 'wrap'}, h(AboutOverlay), h(Loading), h(Navbar), h(TopLevelRouter), h(Footer))

module.exports = {
  App,
}
