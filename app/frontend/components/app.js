import {h} from 'preact'
import {connect} from '../libs/unistore/preact'

import {TopLevelRouter} from './router'
import Welcome from './common/welcome'
import ContactForm from './common/contactForm'
import Footer from './common/footer'
import LoadingOverlay from './common/loadingOverlay'
import NavbarAuth from './common/navbar/navbarAuth'
import NavbarUnauth from './common/navbar/navbarUnauth'
import AddressDetailDialog from './common/addressDetailDialog'
import AutoLogout from './autoLogout'
import {ADALITE_CONFIG} from '../config'
import UnexpectedErrorModal from './common/unexpectedErrorModal'

const {ADALITE_LOGOUT_AFTER} = ADALITE_CONFIG

const Navbar = connect((state) => ({walletIsLoaded: state.walletIsLoaded}))(
  ({walletIsLoaded}) => (walletIsLoaded ? h(NavbarAuth, {}) : h(NavbarUnauth, {}))
)

const App = connect((state) => ({
  displayWelcome: state.displayWelcome,
  showContactFormModal: state.showContactFormModal,
  showUnexpectedErrorModal: state.showUnexpectedErrorModal,
}))(({displayWelcome, showContactFormModal, showUnexpectedErrorModal}) =>
  h(
    'div',
    {class: 'wrap'},
    h(LoadingOverlay, {}),
    h(Navbar, {}),
    h(TopLevelRouter, {}),
    h(Footer, {}),
    h(AddressDetailDialog, {}),
    ADALITE_LOGOUT_AFTER > 0 && h(AutoLogout, {}),
    displayWelcome && h(Welcome, {}),
    showContactFormModal && h(ContactForm, {}),
    showUnexpectedErrorModal && h(UnexpectedErrorModal, {})
  )
)

export default App
