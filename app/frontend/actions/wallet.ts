import {ADALITE_CONFIG} from '../config'
import debugLog from '../helpers/debugLog'
import {
  NETWORKS,
  PREMIUM_MEMBER_BALANCE_TRESHOLD,
  BIG_DELEGATOR_THRESHOLD,
  WANTED_DELEGATOR_STAKING_ADDRESSES,
} from '../wallet/constants'
import {CryptoProviderType} from '../wallet/types'
import ShelleyCryptoProviderFactory from '../wallet/shelley/shelley-crypto-provider-factory'
import {ShelleyWallet} from '../wallet/shelley-wallet'
import getConversionRates from '../helpers/getConversionRates'
import mnemonicToWalletSecretDef from '../wallet/helpers/mnemonicToWalletSecretDef'
import {AccountInfo, Lovelace, AssetFamily, AuthMethodType} from '../types'
import {State, Store} from '../state'
import {initialState} from '../store'
import errorActions from './error'
import loadingActions from './loading'

let wallet: ReturnType<typeof ShelleyWallet>

const fetchConversionRates = async (state: State) => {
  try {
    return await getConversionRates(state)
  } catch (e) {
    debugLog('Could not fetch conversion rates.')
    return null
  }
}

const getWalletInfo = (accountsInfo: Array<AccountInfo>) => {
  const totalWalletBalance = accountsInfo.reduce((a, {balance}) => balance + a, 0)
  const totalRewardsBalance = accountsInfo.reduce(
    (a, {shelleyBalances}) => shelleyBalances.rewardsAccountBalance + a,
    0
  )
  const shouldShowSaturatedBanner = accountsInfo.some(
    ({poolRecommendation}) => poolRecommendation.shouldShowSaturatedBanner
  )
  return {
    totalWalletBalance,
    totalRewardsBalance,
    shouldShowSaturatedBanner,
  }
}

const accountsIncludeStakingAddresses = (
  accountsInfo: Array<AccountInfo>,
  soughtAddresses: Array<string>
): boolean => {
  const stakingAddresses = accountsInfo.map((accountInfo) => accountInfo.stakingAddress)
  return stakingAddresses.some((address) => soughtAddresses.includes(address))
}

export default (store: Store) => {
  const {setState} = store
  const {loadingAction} = loadingActions(store)
  const {setErrorState} = errorActions(store)

  return {
    loadWallet: async (
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

      const isShelleyCompatible = !(
        walletSecretDef && walletSecretDef.derivationScheme.type === 'v1'
      )
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

        wallet = await ShelleyWallet({
          config,
          cryptoProvider,
        })

        const validStakepoolDataProvider = await wallet.getStakepoolDataProvider()
        const accountsInfo = await wallet.getAccountsInfo(validStakepoolDataProvider)
        const {totalRewardsBalance, totalWalletBalance, shouldShowSaturatedBanner} = getWalletInfo(
          accountsInfo
        )

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
        const shouldShowPremiumBanner =
          state.shouldShowPremiumBanner && PREMIUM_MEMBER_BALANCE_TRESHOLD < totalWalletBalance
        const isBigDelegator = totalWalletBalance > BIG_DELEGATOR_THRESHOLD
        setState({
          validStakepoolDataProvider,
          accountsInfo,
          maxAccountIndex,
          totalWalletBalance,
          totalRewardsBalance,
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
          shouldShowPremiumBanner,
          isBigDelegator,
        })
        // TODO: little refactor there
        setState({conversionRates: await fetchConversionRates(state)})
      } catch (e) {
        setState({
          loading: false,
        })
        setErrorState(state, 'walletLoadingError', e)
        setState({
          shouldShowWalletLoadingErrorModal: true,
        })
        return false
      }
      return true
    },
    reloadWalletInfo: async (state: State) => {
      loadingAction(state, 'Reloading wallet info...')
      try {
        const accountsInfo = await wallet.getAccountsInfo(state.validStakepoolDataProvider)

        // timeout setting loading state, so that loading shows even if everything was cached
        setTimeout(() => setState({loading: false}), 500)
        setState({
          accountsInfo,
          ...getWalletInfo(accountsInfo),
        })
        setState({conversionRates: await fetchConversionRates(state)})
      } catch (e) {
        setState({
          loading: false,
        })
        setErrorState(state, 'walletLoadingError', e)
        setState({
          shouldShowWalletLoadingErrorModal: true,
        })
      }
    },
    loadDemoWallet: (state: State) => {
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
    },
    setAuthMethod: (state: State, option: AuthMethodType): void => {
      setState({
        authMethod: option,
        shouldShowExportOption:
          option === AuthMethodType.MNEMONIC || option === AuthMethodType.KEY_FILE,
      })
    },
    logout: (state: State) => {
      wallet = null
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
    },
  }
}
