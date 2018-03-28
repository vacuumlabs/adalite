/* eslint no-console: 0 */

const {CARDANOLITE_CONFIG} = require('./frontendConfigLoader')

let state, middlewares
const root = {}

const reconcile = (existingNode, virtualNode) => {
  if (existingNode.tagName !== virtualNode.tagName) return virtualNode

  const existingChildren = existingNode.children
    ? Array.from(existingNode.children).filter((n) => n instanceof HTMLElement)
    : []
  const virtualChildren = virtualNode.children
    ? Array.from(virtualNode.children).filter((n) => n instanceof HTMLElement)
    : []

  // attributes is a NamedNodeMap, which does not support same api as an array
  for (let i = 0; i < virtualNode.attributes.length; i++) {
    existingNode.setAttribute(virtualNode.attributes[i].name, virtualNode.attributes[i].value)
  }
  // remove attributes no longer valid
  for (let i = 0; i < existingNode.attributes.length; i++) {
    if (!virtualNode.hasAttribute(existingNode.attributes[i].name)) {
      existingNode.removeAttribute(existingNode.attributes[i].name)
    }
  }
  // without children, set inner content and be done
  if (!virtualChildren.length) {
    existingNode.innerHTML = virtualNode.innerHTML
    return existingNode
  }

  // recursively reconcile children
  const existingKeyedChildren = new Map()
  existingChildren.forEach(
    (child) => child.dataset.key && existingKeyedChildren.set(child.dataset.key, child)
  )
  const virtualKeyedChildren = new Map()
  virtualChildren.forEach(
    (child) => child.dataset.key && virtualKeyedChildren.set(child.dataset.key, child)
  )

  while (existingChildren.length && virtualChildren.length) {
    const currentChild = existingChildren[0]

    // Keyed children that don't exist in new virtual DOM are removed. The rest are skipped until
    // encountered in the virtual DOM, unless the key matches the one on the 'nextChild' virtual
    // node - this minimizes the amount of reflows, as it allows us to keep the original node,
    // and ensures we do not lose focus on keyed inputs which did not move in the DOM.
    if (currentChild.dataset.key && virtualChildren[0].dataset.key !== currentChild.dataset.key) {
      !virtualKeyedChildren.has(currentChild.dataset.key) && existingNode.removeChild(currentChild)
      existingChildren.shift()
      continue
    }

    const nextChild = virtualChildren.shift()
    if (nextChild.dataset.key) {
      const existingKeyedChild = existingKeyedChildren.get(nextChild.dataset.key)
      if (existingKeyedChild) {
        const reconciled = reconcile(existingKeyedChild, nextChild)
        reconciled !== currentChild && existingNode.insertBefore(reconciled, currentChild)
      } else {
        existingNode.insertBefore(nextChild, currentChild)
      }
      // do not move currentChild yet, in case more keyed children are to be inserted in the same place
      continue
    } else {
      // keyless are reconciled with the nearest keyless element
      const reconciled = reconcile(currentChild, nextChild)
      reconciled !== currentChild && existingNode.replaceChild(reconciled, currentChild)
      existingChildren.shift()
    }
  }

  // remove what's left in existing
  existingChildren.forEach(
    (c) => !virtualKeyedChildren.has(c.dataset.key) && existingNode.removeChild(c)
  )
  // add what's left in virtual
  virtualChildren.forEach((c) => {
    const existingKeyedChild = existingKeyedChildren.get(c.dataset.key)
    existingKeyedChild
      ? existingNode.appendChild(reconcile(existingKeyedChild, c))
      : existingNode.appendChild(c)
  })

  return existingNode
}

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
    root.virtualDOM.innerHTML = root.component(nextState, previousState)
    reconcile(root.target, root.virtualDOM)
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
    (state) =>
      Object.assign({}, state, {
        router: {
          // assume we're pushing just paths
          pathname: window.location.pathname,
          hash: window.location.hash,
        },
      }),
    'ROUTER ACTION'
  )
}

const init = (initialState, middlewareArray, rootComponent, rootTarget) => {
  state = Object.assign({}, initialState, {
    router: {
      pathname: '',
      hash: '',
    },
  })
  middlewares = middlewareArray
  Object.assign(root, {
    component: rootComponent,
    target: rootTarget,
    virtualDOM: rootTarget.cloneNode(false),
  })
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
