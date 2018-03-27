/* eslint no-console: 0 */

const {CARDANOLITE_CONFIG} = require('./loadConfig')

let state, middlewares
const root = {}

// TODO(TK): make dispatch accept also 'payload' param, so it'll be updater, message, payload.
// Updater's signature will then be (state, payload) => newState
// message is optional, side-effects handled outside
const dispatch = (updater, message, payload) => {
  const previousState = state
  let nextState = updater(state, payload)
  try {
    middlewares.forEach((midFn) => {
      nextState = midFn(nextState, previousState)
    })
    state = nextState
    root.target.innerHTML = root.component(nextState, previousState)
  } finally {
    const t = new Date()

    if (CARDANOLITE_CONFIG.CARDANOLITE_ENABLE_DEBUGGING === 'true') {
      console.group(
        `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}.${t.getMilliseconds()} ${message ||
          'NAMELESS_ACTION'}`
      )
      console.log(previousState)
      console.log(nextState)
      console.groupEnd()
    }
  }
}

// special action that serves as a minimal redux routing - we want the
// route processed in state so we can react in middleware when it changes
const routerAction = function(state) {
  dispatch(
    (state) => Object.assign(
      {},
      state,
      {
        router: {
          // assume we're pushing just paths
          pathname: window.location.pathname,
          hash: window.location.hash,
        },
      }
    ),
    'ROUTER ACTION'
  )
}

const init = (initialState, middlewareArray, rootComponent, rootTarget) => {
  state = Object.assign(
    {},
    initialState,
    {
      router: {
        pathname: '',
        hash: '',
      },
    }
  )
  middlewares = middlewareArray
  root.component = rootComponent
  root.target = rootTarget
  // Super-simple routing - listen to route changes and push them as router actions
  window.onpopstate = routerAction
  window.history.onpushstate = routerAction
  window.onhashchange = routerAction

  if (CARDANOLITE_CONFIG.CARDANOLITE_ENABLE_DEBUGGING === 'true') {
    console.log('initial state', initialState)
  }
  root.target.innerHTML = root.component(initialState, {})
}

module.exports = {
  init,
  dispatch,
}
