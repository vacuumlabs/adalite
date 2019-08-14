const {h} = require('preact')
const connect = require('unistore/preact').connect

const TxHistoryPage = require('./pages/txHistory/txHistoryPage')
const MyAddresses = require('./pages/receiveAda/myAddresses')
const SendPage = require('./pages/sendAda/sendAdaPage')
const LoginPage = require('./pages/login/loginPage')
const ExportWalletPage = require('./pages/exportWallet/exportWalletPage')
const StakingPage = require('./pages/staking/stakingPage')

const TopLevelRouter = connect((state) => ({
  pathname: state.router.pathname,
  walletIsLoaded: state.walletIsLoaded,
  showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
}))(({pathname, walletIsLoaded, showDemoWalletWarningDialog}) => {
  // unlock not wrapped in main
  const currentTab = pathname.split('/')[1]
  if ((!walletIsLoaded || showDemoWalletWarningDialog) && currentTab !== 'staking') {
    // TODO: tab condition added for testing
    window.history.pushState({}, '/', '/')
    return h(LoginPage)
  }
  let content
  switch (currentTab) {
    case 'txHistory':
      content = h(TxHistoryPage)
      break
    case 'receive':
      content = h(MyAddresses)
      break
    case 'send':
      content = h(SendPage)
      break
    case 'exportWallet':
      content = h(ExportWalletPage)
      break
    case 'staking':
      content = h(StakingPage)
      break
    default:
      window.history.pushState({}, 'txHistory', 'txHistory')
      content = h(TxHistoryPage)
  }
  // TODO is Alert used anywhere? if so add here
  return content
})

module.exports = {
  TopLevelRouter,
}
