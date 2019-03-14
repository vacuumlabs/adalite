const {h} = require('preact')
const connect = require('unistore/preact').connect

const TopLevelRouter = require('./router').TopLevelRouter
const Footer = require('./common/footer')
const LoadingOverlay = require('./common/loadingOverlay')
const NavbarAuth = require('./common/navbar/navbarAuth')
const NavbarUnauth = require('./common/navbar/navbarUnauth')
const AddressDetailDialog = require('./common/addressDetailDialog')
const AutoLogout = require('./autoLogout')
const ADALITE_LOGOUT_AFTER = require('../config').ADALITE_CONFIG.ADALITE_LOGOUT_AFTER

const Navbar = connect((state) => ({walletIsLoaded: state.walletIsLoaded}))(
  ({walletIsLoaded}) => (walletIsLoaded ? h(NavbarAuth) : h(NavbarUnauth))
)

const App = () =>
  h(
    'div',
    {class: 'wrap'},
    h(LoadingOverlay),
    h(Navbar),
    h(TopLevelRouter),
    h(Footer),
    h(AddressDetailDialog),
    ADALITE_LOGOUT_AFTER > 0 && h(AutoLogout)
  )

module.exports = App
