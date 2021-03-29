import {NETWORKS, WANTED_DELEGATOR_STAKING_ADDRESSES} from '../wallet/constants'
import {CryptoProviderType} from '../wallet/types'
import ShelleyCryptoProviderFactory from '../wallet/shelley/shelley-crypto-provider-factory'
import {ShelleyWallet} from '../wallet/shelley-wallet'
import mnemonicToWalletSecretDef from '../wallet/helpers/mnemonicToWalletSecretDef'

import debugLog from '../helpers/debugLog'
import getConversionRates from '../helpers/getConversionRates'

import {ADALITE_CONFIG} from '../config'
import {AccountInfo, Lovelace, AssetFamily, AuthMethodType} from '../types'
import {initialState} from '../store'
import {State, Store} from '../state'
import errorActions from './error'
import loadingActions from './loading'

// TODO: (refactor), this should not call "setState" as it is not action
const fetchConversionRates = async (conversionRates, setState) => {
  try {
    setState({
      conversionRates: await conversionRates,
    })
  } catch (e) {
    debugLog('Could not fetch conversion rates.')
    setState({
      conversionRates: null,
    })
  }
}

const accountsIncludeStakingAddresses = (
  accountsInfo: Array<AccountInfo>,
  soughtAddresses: Array<string>
): boolean => {
  const stakingAddresses = accountsInfo.map((accountInfo) => accountInfo.stakingAddress)
  return stakingAddresses.some((address) => soughtAddresses.includes(address))
}

// TODO: we may be able to remove this, kept for backwards compatibility
const getShouldShowSaturatedBanner = (accountsInfo: Array<AccountInfo>) =>
  accountsInfo.some(({poolRecommendation}) => poolRecommendation.shouldShowSaturatedBanner)

type Wallet = ReturnType<typeof ShelleyWallet>
let wallet: Wallet
export const setWallet = (w: Wallet) => {
  wallet = w
}
export const getWallet = (): Wallet => wallet

export default (store: Store) => {
  const {loadingAction} = loadingActions(store)
  const {setError} = errorActions(store)
  const {setState} = store

  const loadWallet = async (
    state: State,
    {
      cryptoProviderType,
      walletSecretDef,
      forceWebUsb,
      shouldExportPubKeyBulk,
    }: {
      cryptoProviderType: CryptoProviderType
      walletSecretDef: any
      forceWebUsb: boolean
      shouldExportPubKeyBulk: boolean
    }
  ) => {
    loadingAction(state, 'Loading wallet data...')
    setState({walletLoadingError: undefined})
    const isShelleyCompatible = !(walletSecretDef && walletSecretDef.derivationScheme.type === 'v1')
    const config = {...ADALITE_CONFIG, isShelleyCompatible, shouldExportPubKeyBulk}
    try {
      const cryptoProvider = await ShelleyCryptoProviderFactory.getCryptoProvider(
        cryptoProviderType,
        {
          walletSecretDef,
          network: NETWORKS[ADALITE_CONFIG.ADALITE_NETWORK],
          config,
          forceWebUsb, // TODO: into config
        }
      )

      setWallet(
        await ShelleyWallet({
          config,
          cryptoProvider,
        })
      )

      const validStakepoolDataProvider = await wallet.getStakepoolDataProvider()
      const accountsInfo = await wallet.getAccountsInfo(validStakepoolDataProvider)
      const shouldShowSaturatedBanner = getShouldShowSaturatedBanner(accountsInfo)

      const conversionRatesPromise = getConversionRates(state)
      const usingHwWallet = wallet.isHwWallet()
      const maxAccountIndex = wallet.getMaxAccountIndex()
      const shouldShowWantedAddressesModal = accountsIncludeStakingAddresses(
        accountsInfo,
        WANTED_DELEGATOR_STAKING_ADDRESSES
      )
      const hwWalletName = usingHwWallet ? wallet.getWalletName() : undefined
      if (usingHwWallet) loadingAction(state, `Waiting for ${hwWalletName}...`)
      const demoRootSecret = (
        await mnemonicToWalletSecretDef(ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC)
      ).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
      const autoLogin = state.autoLogin
      setState({
        validStakepoolDataProvider,
        accountsInfo,
        maxAccountIndex,
        shouldShowSaturatedBanner,
        walletIsLoaded: true,
        loading: false,
        mnemonicAuthForm: {
          mnemonicInputValue: '',
          mnemonicInputError: null,
          formIsValid: false,
        },
        usingHwWallet,
        hwWalletName,
        isDemoWallet,
        shouldShowDemoWalletWarningDialog: isDemoWallet && !autoLogin,
        shouldShowNonShelleyCompatibleDialog: !isShelleyCompatible,
        shouldShowWantedAddressesModal,
        shouldShowGenerateMnemonicDialog: false,
        shouldShowAddressVerification: usingHwWallet,
        // send form
        sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace},
        sendAddress: {fieldValue: ''},
        sendResponse: '',
        // shelley
        isShelleyCompatible,
      })
      await fetchConversionRates(conversionRatesPromise, setState)
    } catch (e) {
      setState({
        loading: false,
      })
      setError(state, {errorName: 'walletLoadingError', error: e})
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
      return false
    }
    return true
  }

  const reloadWalletInfo = async (state: State) => {
    loadingAction(state, 'Reloading wallet info...')
    try {
      const accountsInfo = await wallet.getAccountsInfo(state.validStakepoolDataProvider)
      const conversionRates = getConversionRates(state)

      // timeout setting loading state, so that loading shows even if everything was cached
      setTimeout(() => setState({loading: false}), 500)
      setState({
        accountsInfo,
        shouldShowSaturatedBanner: getShouldShowSaturatedBanner(accountsInfo),
      })
      await fetchConversionRates(conversionRates, setState)
    } catch (e) {
      setState({
        loading: false,
      })
      setError(state, {errorName: 'walletLoadingError', error: e})
      setState({
        shouldShowWalletLoadingErrorModal: true,
      })
    }
  }

  const loadDemoWallet = (state: State) => {
    setState({
      mnemonicAuthForm: {
        mnemonicInputValue: ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC,
        mnemonicInputError: null,
        formIsValid: true,
      },
      walletLoadingError: undefined,
      shouldShowWalletLoadingErrorModal: false,
      authMethod: AuthMethodType.MNEMONIC,
      shouldShowExportOption: true,
    })
  }

  const logout = (state: State) => {
    setWallet(null)
    setState(
      {
        ...initialState,
        displayWelcome: false,
        autoLogin: false,
      },
      // @ts-ignore (we don't have types for forced state overwrite)
      true
    ) // force overwriting the state
    window.history.pushState({}, '/', '/')
  }

  return {
    loadWallet,
    reloadWalletInfo,
    loadDemoWallet,
    logout,
  }
}
