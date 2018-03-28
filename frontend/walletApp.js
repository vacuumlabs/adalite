import {h, render} from 'preact'
import createStore from 'unistore'
import devtools from 'unistore/devtools'
import {Provider} from 'unistore/preact'
import {TopLevelRouter} from './components'

import {CARDANOLITE_CONFIG} from './frontendConfigLoader'

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

const initialState = {
  loading: false,
  loadingMessage: 'Loading your <b>funds</b>.',
  alert: {
    show: false,
    type: 'success', // OPTIONS are error, warning, success
    title: 'Wrong mnemonic',
    hint: 'Hint: Ensure that your mnemonic is without mistake.',
  },
  displayAboutOverlay: true,
  currentTab: 'wallet-info',
  activeWalletId: null,
  currentWalletMnemonicOrSecret:
    'opera jacket raise like injury slogan valid deny someone dove tag weapon',
  newWalletMnemonic: '',
  usedAddresses: [],
  unusedAddresses: [],
  sendAmount: 0,
  router: {
    pathname: window.location.pathname,
    hash: window.location.hash,
  },
}

console.log(devtools)

const store =
  CARDANOLITE_CONFIG.CARDANOLITE_ENABLE_DEBUGGING === 'true'
    ? devtools(createStore(initialState))
    : createStore(initialState)

// complete routing here
window.history.onpushstate = () =>
  store.setState({
    router: {
      pathname: window.location.pathname,
      hash: window.location.hash,
    },
  })
window.onhashchange = () =>
  store.setState({
    router: {
      pathname: window.location.pathname,
      hash: window.location.hash,
    },
  })

const App = h(Provider, {store}, h(TopLevelRouter))

render(App, document.getElementById('root'))
