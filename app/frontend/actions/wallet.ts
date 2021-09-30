import {NETWORKS, WANTED_DELEGATOR_STAKING_ADDRESSES} from '../wallet/constants'
import {CryptoProviderType} from '../wallet/types'
import ShelleyCryptoProviderFactory from '../wallet/shelley/shelley-crypto-provider-factory'
import {ShelleyWallet} from '../wallet/shelley-wallet'
import mnemonicToWalletSecretDef from '../wallet/helpers/mnemonicToWalletSecretDef'

import debugLog from '../helpers/debugLog'
import getConversionRates from '../helpers/getConversionRates'

import {ADALITE_CONFIG} from '../config'
import {AccountInfo, Lovelace, AssetFamily, AuthMethodType, LedgerTransportType} from '../types'
import {initialState} from '../store'
import {State, Store} from '../state'
import errorActions from './error'
import loadingActions from './loading'
import commonActions from './common'

import {saveAs} from '../libs/file-saver'
import {exportWalletSecretDef} from '../wallet/keypass-json'
import {getDefaultLedgerTransportType} from '../wallet/shelley/helpers/transports'
import sleep from '../helpers/sleep'
import {getDateDiffInSeconds} from '../helpers/common'

// TODO: we may be able to remove this, kept for backwards compatibility
const getShouldShowSaturatedBanner = (accountsInfo: Array<AccountInfo>) =>
  accountsInfo.some(({poolRecommendation}) => poolRecommendation.shouldShowSaturatedBanner)

type Wallet = ReturnType<typeof ShelleyWallet>
let wallet: Wallet
export const setWallet = (w: Wallet) => {
  wallet = w
}
export const getWallet = (): Wallet => wallet

const accountsIncludeStakingAddresses = (
  accountsInfo: Array<AccountInfo>,
  soughtAddresses: Array<string>
): boolean => {
  const stakingAddresses = accountsInfo.map((accountInfo) => accountInfo.stakingAddress)
  return stakingAddresses.some((address) => soughtAddresses.includes(address))
}

export default (store: Store) => {
  const {loadingAction} = loadingActions(store)
  const {setError} = errorActions(store)
  const {getState, setState} = store
  const {setWalletOperationStatusType} = commonActions(store)

  const loadAsyncWalletData = async (): Promise<void> => {
    const asyncFetchAndUpdate = async <T extends Partial<State>>(
      fetchFn: () => Promise<T>,
      fallbackValue: T,
      debugMessage: string = null
    ): Promise<void> => {
      try {
        setState(await fetchFn())
      } catch (e) {
        debugMessage ?? debugLog(debugMessage)
        setState(fallbackValue)
      }
    }

    await Promise.all([
      asyncFetchAndUpdate(
        async () => ({conversionRates: await getConversionRates(getState())}),
        {conversionRates: null},
        'Could not fetch conversion rates.'
      ),
      asyncFetchAndUpdate(
        async () => ({tokensMetadata: await wallet.getTokensMetadata(getState().accountsInfo)}),
        {tokensMetadata: new Map()},
        'Could not fetch tokens metadata.'
      ),
    ])
  }

  const loadWallet = async (
    state: State,
    {
      cryptoProviderType,
      walletSecretDef,
      selectedLedgerTransportType,
      shouldExportPubKeyBulk,
    }: {
      cryptoProviderType: CryptoProviderType
      walletSecretDef?: any // TODO: until now, arguments came in freestyle combinations, refactor
      selectedLedgerTransportType?: LedgerTransportType
      shouldExportPubKeyBulk: boolean
    }
  ) => {
    loadingAction(state, 'Loading wallet data...')
    setState({walletLoadingError: undefined})
    const isShelleyCompatible = !(walletSecretDef && walletSecretDef.derivationScheme.type === 'v1')
    const ledgerTransportType =
      selectedLedgerTransportType === LedgerTransportType.DEFAULT
        ? await getDefaultLedgerTransportType()
        : selectedLedgerTransportType
    const config = {
      ...ADALITE_CONFIG,
      isShelleyCompatible,
      shouldExportPubKeyBulk,
      ledgerTransportType,
    }

    try {
      if (
        ledgerTransportType === LedgerTransportType.WEB_HID ||
        ledgerTransportType === LedgerTransportType.WEB_USB
      ) {
        loadingAction(
          state,
          'Loading wallet data...\nIf a prompt appears, click on the Ledger device, then click "Connect."'
        )
      }
      const cryptoProvider = await ShelleyCryptoProviderFactory.getCryptoProvider(
        cryptoProviderType,
        {
          walletSecretDef,
          network: NETWORKS[ADALITE_CONFIG.ADALITE_NETWORK],
          config,
        }
      )
      loadingAction(state, 'Loading wallet data...')

      setWallet(
        await ShelleyWallet({
          config,
          cryptoProvider,
        })
      )

      const validStakepoolDataProvider = await wallet.getStakepoolDataProvider()
      const accountsInfo = await wallet.getAccountsInfo(validStakepoolDataProvider)
      const shouldShowSaturatedBanner = getShouldShowSaturatedBanner(accountsInfo)

      const usingHwWallet = wallet.isHwWallet()
      const maxAccountIndex = wallet.getMaxAccountIndex()
      const shouldShowWantedAddressesModal = accountsIncludeStakingAddresses(
        accountsInfo,
        WANTED_DELEGATOR_STAKING_ADDRESSES
      )
      const hwWalletName = usingHwWallet ? wallet.getWalletName() : null
      if (usingHwWallet) loadingAction(state, `Waiting for ${hwWalletName}...`)
      const demoRootSecret = (
        await mnemonicToWalletSecretDef(ADALITE_CONFIG.ADALITE_DEMO_WALLET_MNEMONIC)
      ).rootSecret
      const isDemoWallet = walletSecretDef && walletSecretDef.rootSecret.equals(demoRootSecret)
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
        hwWalletName,
        isDemoWallet,
        shouldShowNonShelleyCompatibleDialog: !isShelleyCompatible,
        shouldShowWantedAddressesModal,
        shouldShowGenerateMnemonicDialog: false,
        shouldShowAddressVerification: usingHwWallet,
        // send form
        sendAmount: {assetFamily: AssetFamily.ADA, fieldValue: '', coins: 0 as Lovelace},
        sendAddress: {fieldValue: ''},
        // shelley
        isShelleyCompatible,
      })
      loadAsyncWalletData()
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

  let lastReloadTime = new Date()
  const reloadWalletInfo = async (state: State): Promise<void> => {
    setWalletOperationStatusType(state, 'reloading')
    const currentTime = new Date()
    try {
      if (getDateDiffInSeconds(lastReloadTime, currentTime) < 30) {
        await sleep(2000) // fake loading
      } else {
        lastReloadTime = currentTime
        const accountsInfo = await wallet.getAccountsInfo(state.validStakepoolDataProvider)
        const tokensMetadata = await wallet.getTokensMetadata(accountsInfo)

        setState({
          accountsInfo,
          tokensMetadata,
          shouldShowSaturatedBanner: getShouldShowSaturatedBanner(accountsInfo),
        })
        loadAsyncWalletData()
      }
      // timeout setting loading state, so that loading shows even if everything was cached
      await sleep(500)
      if (state.walletOperationStatusType !== 'txPending') {
        setWalletOperationStatusType(state, null)
      }
    } catch (e) {
      setWalletOperationStatusType(state, 'reloadFailed')
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

  const exportJsonWallet = async (state, password, walletName) => {
    const walletExport = JSON.stringify(
      await exportWalletSecretDef(getWallet().getWalletSecretDef(), password, walletName)
    )

    const blob = new Blob([walletExport], {
      type: 'application/json;charset=utf-8',
    })
    saveAs(blob, `${walletName}.json`)
  }

  return {
    loadWallet,
    reloadWalletInfo,
    loadDemoWallet,
    logout,
    getShouldShowSaturatedBanner,
    exportJsonWallet,
  }
}
