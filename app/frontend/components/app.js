const {h} = require('preact')
const connect = require('unistore/preact').connect

const TopLevelRouter = require('./router').TopLevelRouter
const Welcome = require('./common/welcome')
const ContactForm = require('./common/contactForm')
const Footer = require('./common/footer')
const LoadingOverlay = require('./common/loadingOverlay')
const NavbarAuth = require('./common/navbar/navbarAuth')
const NavbarUnauth = require('./common/navbar/navbarUnauth')
const AddressDetailDialog = require('./common/addressDetailDialog')
const AutoLogout = require('./autoLogout')
const ADALITE_LOGOUT_AFTER = require('../config').ADALITE_CONFIG.ADALITE_LOGOUT_AFTER
const UnexpectedErrorModal = require('../components/common/unexpectedErrorModal')

const Navbar = connect((state) => ({walletIsLoaded: state.walletIsLoaded}))(
  ({walletIsLoaded}) => (walletIsLoaded ? h(NavbarAuth) : h(NavbarUnauth))
)

const App = connect((state) => ({
  displayWelcome: state.displayWelcome,
  showContactFormModal: state.showContactFormModal,
  showUnexpectedErrorModal: state.showUnexpectedErrorModal,
}))(({displayWelcome, showContactFormModal, showUnexpectedErrorModal}) =>
  h(
    'div',
    {class: 'wrap'},
    h(LoadingOverlay),
    h(Navbar),
    h(TopLevelRouter),
    h(Footer),
    h(AddressDetailDialog),
    ADALITE_LOGOUT_AFTER > 0 && h(AutoLogout),
    displayWelcome && h(Welcome),
    showContactFormModal && h(ContactForm),
    showUnexpectedErrorModal && h(UnexpectedErrorModal)
  )
)

module.exports = App
