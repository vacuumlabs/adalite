/* eslint no-console: 0 */

let state, root, rootTarget, middlewares

// TODO(TK): make dispatch accept also 'payload' param, so it'll be updater, message, payload.
// Updater's signature will then be (state, payload) => newState
// message is optional, side-effects handled outside
const dispatch = (updater, message) => {
  const previousState = state
  let nextState = updater(state)
  try {
    middlewares.forEach((midFn) => {
      nextState = midFn(nextState, previousState)
    })
    state = nextState
    document.getElementById(rootTarget).innerHTML = root(nextState, previousState)
  } finally {
    const t = new Date()
    console.group(
      `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}.${t.getMilliseconds()} ${message ||
        'NAMELESS_ACTION'}`
    )
    console.log(previousState)
    console.log(nextState)
    console.groupEnd()
  }
}

// special action that serves as a minimal redux routing - we want the
// route processed in state so we can react in middleware when it changes
const routerAction = function(state) {
  dispatch((state) =>
    ({
      ...state,
      router: {
        // assume we're pushing just paths
        pathname: window.location.pathname,
        hash: window.location.hash,
      },
    }),
  'ROUTER ACTION'
  )
}

// TODO(TK) init should accept the the component directly, not 'rootId'.
const init = (initialState, middlewareArray, rootComponent, rootId) => {
  state = {
    ...initialState,
    router: {
      pathname: '',
      hash: '',
    },
  }
  middlewares = middlewareArray
  // TODO(TK) unify the naming. Why root in this module but rootComponent in the function signature?
  root = rootComponent
  rootTarget = rootId
  // Super-simple routing - listen to route changes and push them as router actions
  window.onpopstate = routerAction
  window.history.onpushstate = routerAction
  window.onhashchange = routerAction
  console.log('initial state', initialState)
  document.getElementById(rootTarget).innerHTML = root(initialState, {})
}

module.exports = {
  init,
  dispatch,
}
