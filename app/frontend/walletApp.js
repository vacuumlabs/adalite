// import 'preact/debug' // uncomment to use preact dev tools
import {h, render} from 'preact'
import {Provider as UnistoreStoreProvider} from './libs/unistore/preact'
import {StoreProvider as HooksStoreProvider} from './libs/preact-hooks-unistore'

import {createStore} from './store'
import {ADALITE_CONFIG} from './config'

import {init} from '@sentry/browser'

if (ADALITE_CONFIG.ADALITE_TREZOR_CONNECT_URL) {
  const url = new URL(ADALITE_CONFIG.ADALITE_TREZOR_CONNECT_URL)
  window.__TREZOR_CONNECT_SRC = `${url.origin}/`
}

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

const store = createStore()

// Keep state after hot-reload
// https://github.com/developit/unistore/issues/81#issuecomment-378244539
function addMemory(store) {
  if (window.STATE) store.setState(window.STATE)
  store.subscribe((state) => {
    window.STATE = state
  })
}
addMemory(store)

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

init({
  dsn: ADALITE_CONFIG.SENTRY_DSN,
  environment: ADALITE_CONFIG.ADALITE_ENV,
  // debug: true,
  beforeSend(event) {
    if (!event.exception) return event
    return new Promise((resolve) => {
      store.setState({
        sendSentry: {
          event,
          resolve,
        },
        shouldShowUnexpectedErrorModal: true,
      })
    }).then((tags) => {
      if (tags) event.tags = tags
      return tags ? event : null
    })
  },
  ignoreErrors: [
    // FF 83.0 specific error to be ignored
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1678243
    'XDR encoding failure',
  ],
})

function reload() {
  const App = require('./components/app').default
  const Wrapper = h(HooksStoreProvider, {value: store}, h(UnistoreStoreProvider, {store}, h(App)))
  render(Wrapper, document.getElementById('root'))
}

if (module.hot) {
  module.hot.accept()
}

reload()
