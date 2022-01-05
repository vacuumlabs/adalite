import {h} from 'preact'
import {connect} from '../helpers/connect'
import {TopLevelRouter} from './router'
import Welcome from './common/welcome'
import ContactForm from './common/contactForm'
import Footer from './common/footer'
import LoadingOverlay from './common/loadingOverlay'
import NavbarAuth from './common/navbar/navbarAuth'
import NavbarUnauth from './common/navbar/navbarUnauth'
import AutoLogout from './autoLogout'
import {ADALITE_CONFIG} from '../config'
import UnexpectedErrorModal from './common/unexpectedErrorModal'
import Exchange from './pages/exchange/exchange'
import NufiPreviewPage from './pages/nufiPreview/nufiPreviewPage'

const {ADALITE_LOGOUT_AFTER} = ADALITE_CONFIG

const Navbar = connect((state) => ({walletIsLoaded: state.walletIsLoaded}))(({walletIsLoaded}) =>
  walletIsLoaded ? <NavbarAuth /> : <NavbarUnauth />
)

const App = connect((state) => ({
  pathname: state.router.pathname,
  displayWelcome: state.displayWelcome,
  shouldShowContactFormModal: state.shouldShowContactFormModal,
  shouldShowUnexpectedErrorModal: state.shouldShowUnexpectedErrorModal,
}))(({pathname, displayWelcome, shouldShowContactFormModal, shouldShowUnexpectedErrorModal}) => {
  const currentTab = pathname.split('/')[1]
  if (currentTab === 'exchange') {
    return <Exchange />
  }
  if (currentTab === 'nufi') {
    return (
      <div className="wrap nufi-background">
        <NufiPreviewPage />
        <Footer />
      </div>
    )
  }
  return (
    <div className="wrap">
      <LoadingOverlay />
      <Navbar />
      <TopLevelRouter />
      <Footer />
      {ADALITE_LOGOUT_AFTER > 0 && <AutoLogout />}
      {displayWelcome && <Welcome />}
      {shouldShowContactFormModal && <ContactForm />}
      {shouldShowUnexpectedErrorModal && <UnexpectedErrorModal />}
    </div>
  )
})

export default App
