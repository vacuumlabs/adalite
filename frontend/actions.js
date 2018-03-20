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
  wallet = Cardano.CardanoWallet(mnemonic)
  const activeWalletId = wallet.getId()
  const usedAddresses = await wallet.getUsedAddresses()
  const unusedAddresses = [await wallet.getChangeAddress()]
  const balance = await wallet.getBalance()
  const amount = 0
  const sendAddress = ''
  const sendSuccess = ''
  dispatch((state) => ({...state, activeWalletId, usedAddresses, unusedAddresses, balance, amount, sendAddress, sendSuccess}), 'load wallet from mnemonic')
}

const generateMnemonic = () => {
  const newWalletMnemonic = Cardano.generateMnemonic()
  const currentWalletMnemonicOrSecret = newWalletMnemonic
  dispatch(
    (state) => ({...state, newWalletMnemonic, currentWalletMnemonicOrSecret, activeWalletId: null}),
    'generate mnemonic'
  )
}

const logout = () => {
  dispatch((state) => ({...state, activeWalletId: null}), 'close the wallet')
  wallet = null
}

const reloadBalance = async () => {
  dispatch((state) => ({...state, balance: 'loading...'}), 'loading balance')


  const balance = await wallet.getBalance()
  dispatch((state) => ({...state, balance}), 'balance loaded')
}

const generateNewUnusedAddress = async (offset) => {
  dispatch((state) => ({...state, address: 'loading...'}), 'generate new unused address')
  const newUnusedAddress = await wallet.getChangeAddress(Number.MAX_SAFE_INTEGER, offset)
  dispatch(
    (state) => ({...state, unusedAddresses: state.unusedAddresses.concat([newUnusedAddress])}),
    'balance loaded'
  )
}

const toggleAboutOverlay = () => {
  dispatch(
    (state) => ({...state, displayAboutOverlay: !state.displayAboutOverlay}),
    'toggle about overlay'
  )
}

const setCurrentTab = (currentTab) => {
  dispatch((state) => ({...state, currentTab}), 'set current tab')
}

const saveAddress = (sendAddress) => dispatch((state) => ({...state, sendAddress}), 'address saved')

const saveAmount = (amount) => dispatch((state) => ({...state, amount}), 'amount saved')

const saveMnemonic = (mnemonic) => dispatch((state) => ({...state, mnemonic}), 'amount saved')

const calculateFee = async (address, amount) => {
  dispatch((state) => ({...state, fee: 'loading...'}), 'loading fee')
  const fee = await wallet.getTxFee(address, amount)
  dispatch((state) => ({...state, fee}), 'fee loaded')
}

const submitTransaction = async (address, amount) => {
  dispatch((state) => ({...state, sendSuccess: 'processing transaction'}), 'processing transaction')
  const sendSuccess = await wallet.sendAda(address, amount)
  dispatch((state) => ({...state, sendSuccess}), 'transaction acocmlishement loaded')
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
  saveAddress,
  saveMnemonic,
  saveAmount,
  toggleAboutOverlay,
  setCurrentTab,
}
