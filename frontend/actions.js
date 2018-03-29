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

const validateSendForm = (address, amount) => {
  let allValid = true
  if (!address || address === '') {
    allValid = false
    dispatch(
      (state) =>
        Object.assign({}, state, {
          sendAddress: {
            value: address,
            validation: {
              alert: {
                show: true,
                type: 'error', // OPTIONS are error, warning, success
                title: 'Address cannot be left blank!',
              },
            },
          },
        }),
      'Empty address field'
    )
  } else if (!Cardano.isValidAddress(address)) {
    allValid = false
    dispatch(
      (state) =>
        Object.assign({}, state, {
          sendAddress: {
            value: address,
            validation: {
              alert: {
                show: true,
                type: 'error', // OPTIONS are error, warning, success
                title: 'Invalid address!',
              },
            },
          },
        }),
      'Invalid address'
    )
  }
  if (amount !== Number(amount) || isNaN(amount) || amount <= 0) {
    allValid = false
    dispatch(
      (state) =>
        Object.assign({}, state, {
          sendAmount: {
            value: amount,
            validation: {
              alert: {
                show: true,
                type: 'error', // OPTIONS are error, warning, success
                title: 'Invalid amount! Must be a positive number.',
              },
            },
          },
        }),
      'Invalid amount'
    )
  }
  return allValid
}

const loadWalletFromMnemonic = async (mnemonic) => {
  dispatch(
    (state) =>
      Object.assign(
        {},
        state,
        {loading: true},
        {loadingMessage: 'Loading wallet data...'},
        {alert: {show: false}}
      ),
    'loading balance'
  )

  try {
    wallet = Cardano.CardanoWallet(mnemonic, CARDANOLITE_CONFIG)
  } catch (err) {
    return dispatch(
      (state) =>
        Object.assign({}, state, {
          alert: {
            show: true,
            type: 'error', // OPTIONS are error, warning, success
            title: 'Invalid mnemonic',
            hint: 'Hint: Ensure that your mnemonic is without mistake.',
          },
          loading: false,
        }),
      'failed wallet init'
    )
  }
  try {
    const activeWalletId = wallet.getId()
    const usedAddresses = await wallet.getUsedAddresses()
    const unusedAddresses = [await wallet.getChangeAddress()]
    const transactionHistory = await wallet.getHistory()
    const balance = await wallet.getBalance()
    const sendAmount = {value: 0}
    const sendAddress = {value: ''}
    const sendSuccess = ''
    dispatch(
      (state) =>
        Object.assign({}, state, {
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
        }),
      'load wallet from mnemonic'
    )
  } catch (err) {
    console.ererror(JSON.stringify(err))
    dispatch(
      (state) =>
        Object.assign({}, state, {
          alert: {
            show: true,
            type: 'error', // OPTIONS are error, warning, success
            title: `Wallet initialization failed: ${err.name} </br> ${err.message}`,
            hint: 'Hint: Try again.',
          },
          loading: false,
        }),
      'failed wallet init'
    )
  }
  return 0
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

const reloadWalletInfo = async () => {
  dispatch(
    (state) =>
      Object.assign({}, state, {
        loading: true,
        loadingMessage: 'Reloading wallet info...',
      }),
    'loading balance'
  )

  const balance = await wallet.getBalance()
  const usedAddresses = await wallet.getUsedAddresses()
  const transactionHistory = await wallet.getHistory()

  dispatch(
    (state) =>
      Object.assign({}, state, {
        balance,
        usedAddresses,
        unusedAddresses: state.unusedAddresses.filter((elem) => {
          return usedAddresses.indexOf(elem) < 0
        }),
        transactionHistory,
        loading: false,
      }),
    'wallet info reloaded'
  )
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
    (state) =>
      Object.assign({}, state, {
        sendAddress: {
          value: address,
          validation: null,
        },
        sendAmount: {
          value: amount,
          validation: null,
        },
      }),
    'saving sendAda values'
  )
  if (validateSendForm(address, amount)) {
    dispatch(
      (state) =>
        Object.assign({}, state, {
          loading: true,
          loadingMessage: 'Computing transaction fee...',
          sendAddress: {value: address},
          sendAmount: {value: amount},
        }),
      'loading fee'
    )
    const fee = await wallet.getTxFee(address, amount)
    dispatch(
      (state) =>
        Object.assign(
          {},
          state,
          {fee, loading: false},
          fee > state.sendAmount.value
            ? {
              sendAmount: {
                value: amount,
                validation: {
                  alert: {
                    show: true,
                    type: 'error', // OPTIONS are error, warning, success
                    title: 'Amount too low to cover the fee!',
                    hint: `Hint: Set higher amount, at least ${fee / 1000000} ADA.`,
                  },
                },
              },
            }
            : {}
        ),
      'fee loaded'
    )
  }
}

const submitTransaction = async (address, amount) => {
  await calculateFee(address, amount)
  dispatch(
    (state) =>
      (!state.sendAddress.validation && !state.sendAmount.validation) ?
        Object.assign({}, state, {confirmTransaction: true}) : state,
    'show confirmation dialog'
  )
}

const cancelTransaction = () =>
  dispatch(
    (state) => Object.assign({}, state, {confirmTransaction: false}),
    'canceling transaction'
  )

const confirmTransaction = async (address, amount) => {
  dispatch(
    (state) =>
      Object.assign({}, state, {
        confirmTransaction: false,
        loading: true,
        loadingMessage: 'Submitting transaction...',
      }),
    'processing transaction'
  )

  const sendSuccess = await wallet.sendAda(address, amount)
  dispatch(
    (state) => Object.assign({}, state, {sendSuccess, loading: false}),
    'transaction acocmlishement loaded'
  )
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
  toggleAboutOverlay,
  setCurrentTab,
  cancelTransaction,
  confirmTransaction,
}
