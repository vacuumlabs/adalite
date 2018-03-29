// actions are just functions which also call update

const {CARDANOLITE_CONFIG} = require('./frontendConfigLoader')
const Cardano = require('../wallet/cardano-wallet')
const {dispatch} = require('./simpleRedux.js')

let counter = 0
let wallet = null

const executeKey = '__cardano__global_fns'
window[executeKey] = {}

const fnNames = new Map()
// first arg is function to be called, rest of the arguments are to be passed inside fn.
function execute(fn, ...stringArgs) {
  if (fnNames.get(fn) == null) {
    const name = `function_number_${counter++}`
    fnNames.set(fn, name)
    window[executeKey][name] = fn
  }
  const name = fnNames.get(fn)
  const argStr = stringArgs.join(', ')
  return `window['${executeKey}']['${name}'](${argStr})`
}

const executeAction = (action, ...stringArgs) =>
  execute((...args) => dispatch(action(...args)), ...stringArgs)

const loadingAction = (type, message, optionalArgsObj) => ({
  type,
  payload: {message},
  reducer: (state, {message}) =>
    Object.assign(
      {},
      state,
      {
        loading: true,
        loadingMessage: message,
      },
      optionalArgsObj
    ),
})

const loadWalletFromMnemonic = (mnemonic) => async () => {
  dispatch(loadingAction('loading balance', 'Loading wallet data...'))

  wallet = Cardano.CardanoWallet(mnemonic, CARDANOLITE_CONFIG)

  const activeWalletId = wallet.getId()
  const usedAddresses = await wallet.getUsedAddresses()
  const unusedAddresses = [await wallet.getChangeAddress()]
  const transactionHistory = await wallet.getHistory()
  const balance = await wallet.getBalance()
  const sendAmount = 0
  const sendAddress = ''
  const sendSuccess = ''
  dispatch({
    type: 'load wallet from mnemonic',
    payload: {
      activeWalletId,
      usedAddresses,
      unusedAddresses,
      balance,
      sendAmount,
      sendAddress,
      sendSuccess,
      transactionHistory,
      loading: false,
      currentWalletMnemonicOrSecret: '',
    },
  })
}

const generateMnemonic = () => ({
  type: 'generate mnemonic',
  reducer: (state) => {
    const newWalletMnemonic = Cardano.generateMnemonic()
    return Object.assign({}, state, {
      newWalletMnemonic,
      currentWalletMnemonicOrSecret: newWalletMnemonic,
      activeWalletId: null,
    })
  },
})

const logout = () => ({
  type: 'close the wallet',
  reducer: (state) => {
    wallet = null
    return Object.assign({}, state, {activeWalletId: null})
  },
})

const reloadWalletInfo = () => async (getState) => {
  dispatch(loadingAction('loading balance', 'Reloading wallet info...'))

  const balance = await wallet.getBalance()
  const usedAddresses = await wallet.getUsedAddresses()
  const transactionHistory = await wallet.getHistory()
  const unusedAddresses = getState().unusedAddresses.filter(
    (elem) => usedAddresses.indexOf(elem) < 0
  )

  dispatch({
    type: 'wallet info reloaded',
    payload: {
      balance,
      usedAddresses,
      unusedAddresses,
      transactionHistory,
      loading: false,
    },
  })
}

const generateNewUnusedAddress = (offset) => async () => {
  dispatch({
    type: 'generate new unused address',
    payload: {address: 'loading...'},
    reducer: (state, payload) => Object.assign({}, state, payload),
  })
  const newUnusedAddress = await wallet.getChangeAddress(Number.MAX_SAFE_INTEGER, offset)
  dispatch({
    type: 'balance loaded',
    reducer: (state) =>
      Object.assign({}, state, {
        unusedAddresses: state.unusedAddresses.concat([newUnusedAddress]),
      }),
  })
}

const toggleAboutOverlay = () => ({
  type: 'toggle about overlay',
  reducer: (state) =>
    Object.assign({}, state, {
      displayAboutOverlay: !state.displayAboutOverlay,
    }),
})

const setCurrentTab = (currentTab) => ({
  type: 'set current tab',
  payload: {currentTab},
})

const calculateFee = (address, amount) => async () => {
  dispatch(
    loadingAction('loading fee', 'Computing transaction fee...', {
      sendAddress: address,
      sendAmount: amount,
    })
  )
  const fee = await wallet.getTxFee(address, amount)
  dispatch({
    type: 'fee loaded',
    payload: {fee, loading: false},
  })
}

const submitTransaction = (address, amount) => async () => {
  dispatch(
    loadingAction('processing transaction', 'Submitting transaction...', {
      sendSuccess: 'processing transaction',
    })
  )

  const sendSuccess = await wallet.sendAda(address, amount * 1000000)

  dispatch({
    type: 'transaction accomplishment loaded',
    payload: {sendSuccess, loading: false},
  })
}

module.exports = {
  loadWalletFromMnemonic,
  generateMnemonic,
  reloadWalletInfo,
  generateNewUnusedAddress,
  calculateFee,
  submitTransaction,
  logout,
  execute,
  executeAction,
  toggleAboutOverlay,
  setCurrentTab,
}
