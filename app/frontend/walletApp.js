const {h, render} = require('preact')
const Provider = require('unistore/preact').Provider
const App = require('./components/app')

const {createStore} = require('./store')

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
