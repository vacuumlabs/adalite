const {h} = require('preact')
const connect = require('unistore/preact').connect

const TopLevelRouter = require('./router').TopLevelRouter
const Footer = require('./common/footer')
const LoadingOverlay = require('./common/loadingOverlay')
const NavbarAuth = require('./common/navbar/navbarAuth')
const NavbarUnauth = require('./common/navbar/navbarUnauth')

const Navbar = connect((state) => ({
  walletIsLoaded: state.walletIsLoaded,
}))(({walletIsLoaded}) => (walletIsLoaded ? h(NavbarAuth) : h(NavbarUnauth)))

const App = () =>
  h('div', {class: 'wrap'}, h(LoadingOverlay), h(Navbar), h(TopLevelRouter), h(Footer))

module.exports = App
