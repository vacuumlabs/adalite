import devtools from './libs/unistore/devtools'
import {ADALITE_CONFIG} from './config'
import {initialState} from './state'

const createDefaultStore = require('unistore').default

const createStore = () =>
  ADALITE_CONFIG.ADALITE_ENABLE_DEBUGGING === 'true'
    ? devtools(createDefaultStore(initialState))
    : createDefaultStore(initialState)

export {createStore, initialState}
