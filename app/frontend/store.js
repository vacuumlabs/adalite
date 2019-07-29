const createDefaultStore = require('unistore').default
const devtools = require('unistore/devtools')

const ADALITE_CONFIG = require('./config').ADALITE_CONFIG

const initialState = {
  loading: false,
  loadingMessage: '',
  alert: {
    show: false,
    type: 'success', // OPTIONS are error, warning, success
    title: 'Wrong mnemonic',
    hint: 'Hint: Ensure that your mnemonic is without mistake.',
  },
  displayWelcome: !(window.localStorage.getItem('dontShowDisclaimer') === 'true'),
  currentTab: 'wallet-info',
  walletIsLoaded: false,
  showStakingBanner: !(window.localStorage.getItem('dontShowStakingBanner') === 'true'),
  newWalletMnemonic: '',
  ownAddressesWithMeta: [],
  // todo - object (sub-state) from send-ada form
  sendAddress: {fieldValue: ''},
  sendAmount: {fieldValue: 0},
  transactionFee: 0,
  sendAmountForTransactionFee: 0,
  router: {
    pathname: window.location.pathname,
    hash: window.location.hash,
  },
  mnemonicInputValue: '',
  validationMsg: undefined,
  authMethod: ['#trezor', '#hw-wallet'].includes(window.location.hash) ? 'hw-wallet' : '',
  showDemoWalletWarningDialog: false,
  logoutNotificationOpen: false,
  rawTransactionOpen: false,
  rawTransaction: '',
  showMnemonicInfoAlert: false,
  transactionHistory: [],
  sendResponse: {},
  emailSubmitSuccess: false,
}

const createStore = () =>
  ADALITE_CONFIG.ADALITE_ENABLE_DEBUGGING === 'true'
    ? devtools(createDefaultStore(initialState))
    : createDefaultStore(initialState)

module.exports = {
  createStore,
  initialState,
}
