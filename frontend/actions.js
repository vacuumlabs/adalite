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

const setInputValue = () => {
  dispatch((state) => ({...state, controlledInputValue: window.event.target.value}), 'set input value')
}

const submitMnemonic = (mnemonic) => {
  wallet = Cardano.CardanoWallet(mnemonic)
  const rootSecret = wallet.getRootSecret().getSecretKey()
  dispatch((state) => ({...state, rootSecret}), 'submit mnemonic')
}

const generateMenmonic = () => {
  const newMnemonic = Cardano.generateMnemonic()
  dispatch((state) => ({...state, newMnemonic}), 'generate mnemonic')
}

const logout = () => dispatch((state) => ({...state, rootSecret: null}), 'close the wallet')


const reloadBalance = async () => {
  dispatch((state) => ({...state, balance: 'loading...'}), 'loading balance')


  const balance = await wallet.getBalance()
  dispatch((state) => ({...state, balance}), 'balance loaded')
}

const getRecieveAddress = async () => {
  dispatch((state) => ({...state, address: 'loading...'}), 'loading balance')
  const recieve = await wallet.getChangeAddress(1000)
  dispatch((state) => ({...state, recieve}), 'balance loaded')
}


module.exports = {
  setInputValue,
  submitMnemonic,
  generateMenmonic,
  reloadBalance,
  getRecieveAddress,
  logout,
  execute,
}
