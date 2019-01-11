const {h} = require('preact')
const connect = require('unistore/preact').connect

const TxHistoryPage = require('./pages/txHistory/txHistoryPage')
const ReceivePage = require('./pages/receiveAda/receiveAdaPage')
const SendPage = require('./pages/sendAda/sendAdaPage')
const LoginPage = require('./pages/login/loginPage')
const ExportWalletPage = require('./pages/exportWallet/exportWalletPage')

const TopLevelRouter = connect((state) => ({
  pathname: state.router.pathname,
  walletIsLoaded: state.walletIsLoaded,
  showDemoWalletWarningDialog: state.showDemoWalletWarningDialog,
}))(({pathname, walletIsLoaded, showDemoWalletWarningDialog}) => {
  // unlock not wrapped in main
  if (!walletIsLoaded || showDemoWalletWarningDialog) return h(LoginPage)
  const currentTab = pathname.split('/')[1]
  let content
  switch (currentTab) {
    case 'txHistory':
      content = h(TxHistoryPage)
      break
    case 'receive':
      content = h(ReceivePage)
      break
    case 'send':
      content = h(SendPage)
      break
    case 'exportWallet':
      content = h(ExportWalletPage)
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
