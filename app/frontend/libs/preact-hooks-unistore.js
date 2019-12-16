/**
 * Inspired heavily by https://github.com/reduxjs/react-redux
 */

import {useRef, useContext, useEffect, useLayoutEffect, useReducer, useMemo} from 'preact/hooks'
import {createContext} from 'preact'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const refEquality = (a, b) => a === b

// select('foo,bar') creates a function of the form: ({ foo, bar }) => ({ foo, bar })
const select = (properties) => {
  properties = properties.split(/\s*,\s*/)

  return (state) => {
    const selected = {}
    for (let i = 0; i < properties.length; i++) {
      selected[properties[i]] = state[properties[i]]
    }
    return selected
  }
}

export const StoreContext = createContext(null)

export const StoreProvider = StoreContext.Provider

export const useStore = () => useContext(StoreContext)

// selector can be a string 'foo,bar' or a function (state => state.foo)
export const useSelector = (selector, equalityFn = refEquality) => {
  const store = useStore()
  const [, forceRerender] = useReducer((s) => s + 1, 0)

  const selectorRef = useRef(null)
  const selectedStateRef = useRef(null)
  const onChangeErrorRef = useRef(null)
  const isSelectorStr = typeof selector === 'string'

  let selectedState

  try {
    if (selectorRef.current !== selector || onChangeErrorRef.current) {
      const state = store.getState()
      selectedState = isSelectorStr ? select(selector)(state) : selector(state)
    } else {
      selectedState = selectedStateRef.current
    }
  } catch (err) {
    let errorMessage = `An error occured while selecting the store state: ${err.message}.`

    if (onChangeErrorRef.current) {
      errorMessage +=
        '\nThe error may be related to the previous error:' +
        `\n${onChangeErrorRef.current.stack}\n\nOriginal stack trace:`
    }

    throw new Error(errorMessage)
  }

  useIsomorphicLayoutEffect(() => {
    selectorRef.current = isSelectorStr ? select(selector) : selector
    selectedStateRef.current = selectedState
    onChangeErrorRef.current = null
  })

  useIsomorphicLayoutEffect(
    () => {
      const checkForUpdates = () => {
        try {
          const newSelectedState = selectorRef.current(store.getState())
          if (equalityFn(newSelectedState, selectedStateRef.current)) return
          selectedStateRef.current = newSelectedState
        } catch (err) {
          onChangeErrorRef.current = err
        }

        forceRerender({})
      }

      const unsubscribe = store.subscribe(checkForUpdates)
      checkForUpdates()
      return () => unsubscribe()
    },
    [store]
  )

  return selectedState
}

export const useAction = (action) => {
  const store = useStore()

  return useMemo(() => store.action(action), [store, action])
}
