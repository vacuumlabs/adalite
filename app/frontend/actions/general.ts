import {Store, State} from '../state'
import delegateActions from './delegate'
import commonActions from './common'
import {ADALITE_CONFIG} from '../config'
import {MainTabs} from '../constants'
import {localStorageVars} from '../localStorage'
import {AuthMethodType} from '../types'

export default (store: Store) => {
  const {setState} = store
  const {resetDelegation} = delegateActions(store)
  const {resetSendFormFields, resetTransactionSummary, resetAccountIndexes} = commonActions(store)

  const openWelcome = (state: State) => {
    setState({
      displayWelcome: true,
    })
  }

  const closeWelcome = (state, dontShowDisclaimer) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem(localStorageVars.WELCOME, dontShowDisclaimer)
    setState({
      displayWelcome: false,
    })
  }

  const openInfoModal = (state) => {
    setState({
      displayInfoModal: true,
    })
  }

  const closeInfoModal = (state, dontShowInfoModal) => {
    // we may get an ignored click event as the second argument, check only against booleans
    window.localStorage.setItem(localStorageVars.INFO_MODAL, dontShowInfoModal)
    setState({
      displayInfoModal: false,
    })
  }

  const closeStakingBanner = (state) => {
    window.localStorage.setItem(localStorageVars.STAKING_BANNER, 'true')
    setState({
      shouldShowStakingBanner: false,
    })
  }

  const closePremiumBanner = (state) => {
    window.localStorage.setItem(localStorageVars.PREMIUM_BANNER, 'true')
    setState({
      seenPremiumBanner: true,
    })
  }

  const shouldShowContactFormModal = (state) => {
    setState({
      shouldShowContactFormModal: true,
    })
  }

  const closeContactFormModal = (state) => {
    setState({
      shouldShowContactFormModal: false,
    })
  }

  const setLogoutNotificationOpen = (state, open) => {
    setState({
      logoutNotificationOpen: open,
    })
  }

  const setActiveMainTab = (state: State, mainTab: MainTabs) => {
    resetAccountIndexes(state)
    setState({activeMainTab: mainTab})
    resetTransactionSummary(state)
    resetSendFormFields(state)
    resetDelegation()
  }

  const closeUnexpectedErrorModal = (state) => {
    setState({
      shouldShowUnexpectedErrorModal: false,
    })
  }

  const loadErrorBannerContent = (state) => {
    const errorBannerContent = ADALITE_CONFIG.ADALITE_ERROR_BANNER_CONTENT
    const shouldShowErrorBanner = !!errorBannerContent
    setState({
      errorBannerContent,
      shouldShowStakingBanner: shouldShowErrorBanner ? false : state.shouldShowStakingBanner,
    })
  }

  const setAuthMethod = (state: State, authMethod: AuthMethodType): void => {
    setState({authMethod})
  }

  const closeNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: false,
    })
  }

  const openNonShelleyCompatibleDialog = (state) => {
    setState({
      shouldShowNonShelleyCompatibleDialog: true,
    })
  }

  const closeWalletLoadingErrorModal = (state) => {
    setState({
      shouldShowWalletLoadingErrorModal: false,
    })
  }

  const closeWantedAddressModal = (state) => {
    setState({
      shouldShowWantedAddressesModal: false,
    })
  }

  return {
    openWelcome,
    closeWelcome,
    setLogoutNotificationOpen,
    closeUnexpectedErrorModal,
    shouldShowContactFormModal,
    closeContactFormModal,
    closeStakingBanner,
    setActiveMainTab,
    loadErrorBannerContent,
    openInfoModal,
    closeInfoModal,
    closePremiumBanner,
    setAuthMethod,
    closeNonShelleyCompatibleDialog,
    openNonShelleyCompatibleDialog,
    closeWalletLoadingErrorModal,
    closeWantedAddressModal,
  }
}
