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
import Exchange from './pages/exchange/exchange'
import NufiPreviewPage from './pages/nufiPreview/nufiPreviewPage'
import ErrorBoundary from './errorBoundary'
import * as bitbox from 'bitbox-api'
import {useEffect} from 'preact/hooks'

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
  useEffect(() => {
    try {
      bitbox.bitbox02ConnectAuto(() => {
        console.log('Onclose')
      }).then((x) => {
        console.log('Debug bitbox connect', x)
      })
    } catch (e) {
      console.error('BB lib error', e)
    }
  }, [])
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
      <ErrorBoundary>
        <LoadingOverlay />
        <Navbar />
        <TopLevelRouter />
        <Footer />
        {ADALITE_LOGOUT_AFTER > 0 && <AutoLogout />}
        {displayWelcome && <Welcome />}
        {shouldShowContactFormModal && <ContactForm />}
      </ErrorBoundary>
    </div>
  )
})

export default App
