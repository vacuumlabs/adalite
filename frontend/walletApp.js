// polyfill to trigger onpushstate events on history api
// http://felix-kling.de/blog/2011/01/06/how-to-detect-history-pushstate/

;(function(history) {
  const pushState = history.pushState
  history.pushState = function(state) {
    // must be before our function so that url changes before we dispatch the action
    const retValue = pushState.apply(history, arguments) // eslint-disable-line prefer-rest-params
    if (typeof history.onpushstate === 'function') {
      history.onpushstate({state})
    }
    return retValue
  }
})(window.history)

// init the application
const TopLevelRouter = require('./components')
const sampleMid = require('./middleware')
const {init} = require('./simpleRedux')

init(
  {
    loading: false,
    loadingMessage: 'Loading your <b>funds</b>.',
    alert: {
      show: false,
      type: 'success', // OPTIONS are error, warning, success
      title: 'Wrong mnemonic',
      hint: 'Hint: Ensure that your mnemonic is without mistake.',
    },
    displayAboutOverlay: false,
    currentTab: 'wallet-info',
    activeWalletId: null,
    currentWalletMnemonicOrSecret:
      'opera jacket raise like injury slogan valid deny someone dove tag weapon',
    newWalletMnemonic: '',
    usedAddresses: [],
    unusedAddresses: [],
    sendAmount: {value: 0},
  },
  [sampleMid],
  TopLevelRouter,
  document.getElementById('root')
)
