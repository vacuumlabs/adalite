import Cardano from '../wallet/cardano-wallet'
import {CARDANOLITE_CONFIG} from './frontendConfigLoader'

let wallet = null

export default ({setState, getState}) => {
  const loadingAction = (message, optionalArgsObj) =>
    Object.assign(
      {},
      {
        loading: true,
        loadingMessage: message,
      },
      optionalArgsObj
    )

  const loadWalletFromMnemonic = async (state, mnemonic) => {
    setState(loadingAction('Loading wallet data...'))

    wallet = Cardano.CardanoWallet(mnemonic, CARDANOLITE_CONFIG)

    const activeWalletId = wallet.getId()
    const usedAddresses = await wallet.getUsedAddresses()
    const unusedAddresses = [await wallet.getChangeAddress()]
    const transactionHistory = await wallet.getHistory()
    const balance = await wallet.getBalance()
    const sendAmount = 0
    const sendAddress = ''
    const sendSuccess = ''
    setState({
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
    })
  }

  const generateMnemonic = (state) => {
    const newWalletMnemonic = Cardano.generateMnemonic()
    return {
      newWalletMnemonic,
      currentWalletMnemonicOrSecret: newWalletMnemonic,
      activeWalletId: null,
    }
  }

  const logout = () => {
    wallet = null
    return {activeWalletId: null}
  }

  const reloadWalletInfo = async () => {
    setState(loadingAction('Reloading wallet info...'))

    const balance = await wallet.getBalance()
    const usedAddresses = await wallet.getUsedAddresses()
    const transactionHistory = await wallet.getHistory()
    const unusedAddresses = getState().unusedAddresses.filter(
      (elem) => usedAddresses.indexOf(elem) < 0
    )

    setState({
      balance,
      usedAddresses,
      unusedAddresses,
      transactionHistory,
      loading: false,
    })
  }

  const generateNewUnusedAddress = async (state, offset) => {
    setState({address: 'loading...'})
    const newUnusedAddress = await wallet.getChangeAddress(Number.MAX_SAFE_INTEGER, offset)
    setState({
      unusedAddresses: state.unusedAddresses.concat([newUnusedAddress]),
    })
  }

  const toggleAboutOverlay = (state) => ({
    displayAboutOverlay: !state.displayAboutOverlay,
  })

  const calculateFee = async (address, amount) => {
    setState(
      loadingAction('Computing transaction fee...', {
        sendAddress: address,
        sendAmount: amount,
      })
    )
    const fee = await wallet.getTxFee(address, amount)
    setState({fee, loading: false})
  }

  const submitTransaction = async (state, address, amount) => {
    setState(
      loadingAction('processing transaction', 'Submitting transaction...', {
        sendSuccess: 'processing transaction',
      })
    )

    const sendSuccess = await wallet.sendAda(address, amount * 1000000)

    setState({sendSuccess, loading: false})
  }

  return {
    loadingAction,
    loadWalletFromMnemonic,
    generateMnemonic,
    logout,
    reloadWalletInfo,
    generateNewUnusedAddress,
    toggleAboutOverlay,
    calculateFee,
    submitTransaction,
  }
}
