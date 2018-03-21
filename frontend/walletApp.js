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


// eslint-disable-next-line no-undef
CARDANOLITE_CONFIG = JSON.parse(document.body.getAttribute('data-config'))

init(
  {
    loading: false,
    displayAboutOverlay: true,
    currentTab: 'new-wallet',
    activeWalletId: null,
    currentWalletMnemonicOrSecret: 'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3',
    newWalletMnemonic: '',
    usedAddresses: [],
    unusedAddresses: [],
    sendAmount: 0,
  },
  [sampleMid],
  TopLevelRouter,
  document.getElementById('root')
)
