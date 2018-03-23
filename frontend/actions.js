// actions are just functions which also call update

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

const loadWalletFromMnemonic = async (mnemonic) => {
  dispatch(
    (state) =>
      Object.assign(
        {},
        state,
        {loading: true},
        {loadingMessage: 'Loading wallet data...'}
      ),
    'loading balance'
  )

  // eslint-disable-next-line no-undef
  wallet = Cardano.CardanoWallet(mnemonic, CARDANOLITE_CONFIG)

  const activeWalletId = wallet.getId()
  const usedAddresses = await wallet.getUsedAddresses()
  const unusedAddresses = [await wallet.getChangeAddress()]
  const transactionHistory = await wallet.getHistory()
  const balance = await wallet.getBalance()
  const amount = 0
  const sendAddress = ''
  const sendSuccess = ''
  dispatch(
    (state) =>
      Object.assign({}, state, {
        activeWalletId,
        usedAddresses,
        unusedAddresses,
        balance,
        amount,
        sendAddress,
        sendSuccess,
        transactionHistory,
        loading: false,
        currentWalletMnemonicOrSecret: '',
      }),
    'load wallet from mnemonic'
  )
}

const generateMnemonic = () => {
  const newWalletMnemonic = Cardano.generateMnemonic()
  const currentWalletMnemonicOrSecret = newWalletMnemonic
  dispatch(
    (state) =>
      Object.assign({}, state, {
        newWalletMnemonic,
        currentWalletMnemonicOrSecret,
        activeWalletId: null,
      }),
    'generate mnemonic'
  )
}

const logout = () => {
  dispatch((state) => Object.assign({}, state, {activeWalletId: null}), 'close the wallet')
  wallet = null
}

const reloadBalance = async () => {
  dispatch((state) => Object.assign({}, state, {loading: true, loadingMessage: 'Reloading balance...'}), 'loading balance')
  const balance = await wallet.getBalance()
  dispatch((state) => Object.assign({}, state, balance, {loading: false}), 'balance loaded')
}

const reloadTransactionHistory = async () => {
  const transactionHistory = await wallet.getHistory()
  dispatch((state) => Object.assign({}, state, {transactionHistory}), 'history updated')
}

const generateNewUnusedAddress = async (offset) => {
  dispatch(
    (state) => Object.assign({}, state, {address: 'loading...'}),
    'generate new unused address'
  )
  const newUnusedAddress = await wallet.getChangeAddress(Number.MAX_SAFE_INTEGER, offset)
  dispatch(
    (state) =>
      Object.assign({}, state, {unusedAddresses: state.unusedAddresses.concat([newUnusedAddress])}),
    'balance loaded'
  )
}

const toggleAboutOverlay = () => {
  dispatch(
    (state) => Object.assign({}, state, {displayAboutOverlay: !state.displayAboutOverlay}),
    'toggle about overlay'
  )
}

const setCurrentTab = (currentTab) => {
  dispatch((state) => Object.assign({}, state, {currentTab}), 'set current tab')
}

const calculateFee = async (address, amount) => {
  dispatch(
    (state) => Object.assign({}, state, {loading: true, loadingMessage: 'Computing transaction fee...', sendAddress: address, sendAmount: amount}),
    'loading fee'
  )
  const fee = await wallet.getTxFee(address, amount)
  dispatch((state) => Object.assign({}, state, {fee, loading: false}), 'fee loaded')
}

const submitTransaction = async (address, amount) => {
  dispatch(
    (state) => Object.assign({}, state, {sendSuccess: 'processing transaction', loading: true, loadingMessage: 'Submitting transaction...'}),
    'processing transaction'
  )
  const sendSuccess = await wallet.sendAda(address, amount * 1000000)
  dispatch(
    (state) => Object.assign({}, state, {sendSuccess, loading: false}),
    'transaction acocmlishement loaded'
  )
}

module.exports = {
  loadWalletFromMnemonic,
  generateMnemonic,
  reloadBalance,
  generateNewUnusedAddress,
  calculateFee,
  submitTransaction,
  logout,
  execute,
  toggleAboutOverlay,
  setCurrentTab,
  reloadTransactionHistory,
}
