import {h, render} from 'preact'
import createStore from 'unistore'
import devtools from 'unistore/devtools'
import {Provider} from 'unistore/preact'
import {App} from './components'

import {CARDANOLITE_CONFIG} from './config'

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
  displayAboutOverlay: !window.localStorage.getItem('dontShowDisclaimer'),
  currentTab: 'wallet-info',
  walletIsLoaded: false,
  newWalletMnemonic: '',
  ownAddresses: [],
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
}

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

window.onpopstate = (event) =>
  store.setState({
    router: {
      pathname: event.target.location.pathname,
      hash: event.target.location.hash,
    },
  })

window.onhashchange = () =>
  store.setState({
    router: {
      pathname: window.location.pathname,
      hash: window.location.hash,
    },
  })

const Wrapper = h(Provider, {store}, h(App))

render(Wrapper, document.getElementById('root'))
