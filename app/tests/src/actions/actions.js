import assert from 'assert'
import loadWasmModule from '../loadWasmModule'
import {initialState} from '../../../frontend/state'
import {default as actions} from '../../../frontend/actions'

window.wasm = null
before(loadWasmModule)

export const setStateFn = function(state, changes) {
  for (const [key, val] of Object.entries(changes)) {
    state[key] = val
  }
}

export const getStateFn = function(state) {
  return state
}

export function assertPropertiesEqual(state, expectedState) {
  for (const [key, val] of Object.entries(expectedState)) {
    assert.deepEqual(state[key], val, `${key} not matching`)
  }
}

export function setupState() {
  const cloneDeep = require('lodash/fp/cloneDeep')
  const state = cloneDeep(initialState)

  const getState = () => getStateFn(state)
  const setState = (change) => setStateFn(state, change)
  const action = actions({setState, getState})
  return [state, action]
}

// eslint-disable-next-line prefer-arrow-callback
describe('Test wallet actions', function() {
  this.timeout(5000) // this doesn't work in Mocha with arrow functions
  require('./wallet-actions')
})
