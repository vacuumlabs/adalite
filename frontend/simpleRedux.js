/* eslint no-console: 0 */

// super-simple 'redux' pattern

let state = {}

// component from which we start rendering and id where we render it stored here internally
let root = () => ''
let rootTarget = ''
let middlewares = []

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

const init = (initialState, middlewareArray, rootComponent, rootId) => {
  state = {
    ...initialState,
    router: {
      pathname: '',
      hash: '',
    },
  }
  middlewares = middlewareArray
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
