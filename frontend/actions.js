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
  const rootSecret = wallet.getRootSecret().getSecretKey()
  const usedAddresses = await wallet.getUsedAddresses()
  const unusedAddresses = [await wallet.getChangeAddress()]
  const balance = await wallet.getBalance()
  dispatch((state) => ({...state, rootSecret, usedAddresses, unusedAddresses, balance}), 'load wallet from mnemonic')
}

const generateMnemonic = () => {
  const newWalletMnemonic = Cardano.generateMnemonic()
  const currentWalletMnemonicOrSecret = newWalletMnemonic
  dispatch((state) => ({...state, newWalletMnemonic, currentWalletMnemonicOrSecret, rootSecret: null, }), 'generate mnemonic')
}

const logout = () => dispatch((state) => ({...state, rootSecret: null}), 'close the wallet')


const reloadBalance = async () => {
  dispatch((state) => ({...state, balance: 'loading...'}), 'loading balance')


  const balance = await wallet.getBalance()
  dispatch((state) => ({...state, balance}), 'balance loaded')
}

const generateNewUnusedAddress = async (offset) => {
  dispatch((state) => ({...state, address: 'loading...'}), 'generate new unused address')
  const newUnusedAddress = await wallet.getChangeAddress(Number.MAX_SAFE_INTEGER, offset)
  dispatch((state) => ({...state, 'unusedAddresses': state.unusedAddresses.concat([newUnusedAddress])}), 'balance loaded')
}

const toggleAboutOverlay = () => {
  dispatch((state) => ({...state, displayAboutOverlay: !state.displayAboutOverlay}), 'toggle about overlay')
}

const setCurrentTab = (currentTab) => {
  dispatch((state) => ({...state, currentTab}), 'set current tab')
}


module.exports = {
  loadWalletFromMnemonic,
  generateMnemonic,
  reloadBalance,
  generateNewUnusedAddress,
  logout,
  execute,
  toggleAboutOverlay,
  setCurrentTab,
}
