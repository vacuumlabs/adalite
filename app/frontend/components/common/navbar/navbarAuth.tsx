import {h, Component} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {ADALITE_CONFIG} from '../../../config'
const APP_VERSION = ADALITE_CONFIG.ADALITE_APP_VERSION

interface Router {
  pathname: string
  hash: string
}
interface Props {
  router: Router
  isDemoWallet: boolean
  logout: () => void
  openWelcome: any
}

class NavbarAuth extends Component<Props, {}> {
  scrollDestination: any

  constructor(props) {
    super(props)
    this.scrollToTop = this.scrollToTop.bind(this)
  }

  scrollToTop() {
    if (window.innerWidth < 767) {
      window.scrollTo(0, this.scrollDestination.offsetHeight)
    } else {
      window.scrollTo(0, 0)
    }
  }

  componentDidMount() {
    this.scrollToTop()
  }

  componentDidUpdate(prevProps) {
    if (this.props.router.pathname !== prevProps.router.pathname) {
      this.scrollToTop()
    }
  }

  render({isDemoWallet, logout, openWelcome}) {
    return h(
      'nav',
      {
        class: `navbar authed ${isDemoWallet ? 'demo' : ''}`,
        ref: (element) => {
          this.scrollDestination = element
        },
      },
      h(
        'div',
        {class: 'navbar-wrapper'},
        h(
          'h1',
          {class: 'navbar-heading'},
          h('span', {class: 'navbar-title'}, 'AdaLite - Cardano Wallet'),
          h(
            'a',
            {
              href: '#',
              onClick: (e) => {
                e.preventDefault()
                window.history.pushState({}, 'txHistory', 'txHistory')
              },
            },
            h('img', {
              src: 'assets/adalite-logo.svg',
              alt: 'AdaLite - Cardano Wallet',
              class: 'navbar-logo',
            })
          )
        ),
        isDemoWallet && h('div', {class: 'navbar-demo'}, 'Accessing demo wallet'),
        h('div', {class: 'navbar-version'}, `Ver. ${APP_VERSION}`),
        h(
          'div',
          {class: 'navbar-content'},
          h(
            'a',
            {
              class: 'navbar-link',
              href: '#',
              onClick: (e) => {
                e.preventDefault()
                openWelcome()
              },
            },
            'About'
          ),
          h(
            'a',
            {
              class: 'navbar-link',
              href: 'https://github.com/vacuumlabs/adalite/wiki/AdaLite-FAQ',
              target: '_blank',
              rel: 'noopener',
            },
            'Help'
          )
        ),
        h(
          'button',
          {
            class: 'button logout',
            onClick: () => setTimeout(logout, 100),
          },
          'Logout'
        )
      )
    )
  }
}

export default connect(
  (state) => ({
    isDemoWallet: state.isDemoWallet,
    router: state.router,
  }),
  actions
)(NavbarAuth)
