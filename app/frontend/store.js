const createDefaultStore = require('unistore').default
const devtools = require('unistore/devtools')

const ADALITE_CONFIG = require('./config').ADALITE_CONFIG

const initialState = {
  loading: false,
  loadingMessage: 'Loading your <b>funds</b>.',
  alert: {
    show: false,
    type: 'success', // OPTIONS are error, warning, success
    title: 'Wrong mnemonic',
    hint: 'Hint: Ensure that your mnemonic is without mistake.',
  },
  displayAboutOverlay: !window.localStorage.getItem('dontShowDisclaimer'),
  currentTab: 'wallet-info',
  walletIsLoaded: false,
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
  mnemonic: '',
  validationMsg: undefined,
  authMethod: window.location.hash in ['#trezor', '#hw-wallet'] ? 'hw-wallet' : 'mnemonic',
  showDemoWalletWarningDialog: false,
  logoutNotificationOpen: false,
  rawTransactionOpen: false,
  rawTransaction: '',
}

const createStore = () =>
  ADALITE_CONFIG.ADALITE_ENABLE_DEBUGGING === 'true'
    ? devtools(createDefaultStore(initialState))
    : createDefaultStore(initialState)

module.exports = {
  createStore,
}
