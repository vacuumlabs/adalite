const {h} = require('preact')
const connect = require('unistore/preact').connect

const DashboardPage = require('./pages/dashboard/dashboardPage')
const ReceivePage = require('./pages/receive_ada/receiveAdaPage')
const SendPage = require('./pages/send_ada/sendAdaPage')
const LoginPage = require('./pages/login/loginPage')

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
    case 'dashboard':
      content = h(DashboardPage)
      break
    case 'receive':
      content = h(ReceivePage)
      break
    case 'send':
      content = h(SendPage)
      break
    default:
      content = h(DashboardPage)
  }
  // TODO is Alert used anywhere? if so add here
  return h('main', {class: 'main'}, content)
})

module.exports = {
  TopLevelRouter,
}
