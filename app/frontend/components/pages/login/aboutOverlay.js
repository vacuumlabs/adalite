const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')
const Alert = require('../../common/alert')
const Branding = require('../../common/branding')

const WelcomeArticle = ({children, title, icon}) =>
  h(
    'article',
    {class: `greeting-article ${icon ? `icon ${icon}` : ''}`},
    h('h3', {class: 'article-title'}, title),
    h('p', {class: 'article-paragraph'}, children)
  )

class AboutOverlayClass extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dontShowAgainCheckbox: false,
    }
    this.checkboxClick = this.checkboxClick.bind(this)
    this.toggleAboutOverlay = this.toggleAboutOverlay.bind(this)
  }

  checkboxClick() {
    this.setState({dontShowAgainCheckbox: !this.state.dontShowAgainCheckbox})
  }

  toggleAboutOverlay() {
    this.props.toggleAboutOverlay(this.state.dontShowAgainCheckbox)
  }

  render({toggleAboutOverlay}, {dontShowAgainCheckbox}) {
    return h(
      Modal,
      {closeHandler: toggleAboutOverlay},
      h(
        'section',
        {class: 'greeting'},
        h(
          'div',
          {class: 'greeting-head'},
          h('h2', {class: 'modal-title'}, 'Welcome to AdaLite'),
          h(
            'p',
            {class: 'modal-paragraph bigger'},
            'We are an open-source client-side interface for direct \n interaction with the Cardano blockchain.'
          )
        ),
        h(
          Alert,
          {alertType: 'warning'},
          'To be safe from losing access to your funds, please read the following advice carefully.'
        ),
        h(
          'div',
          {class: 'greeting-articles'},
          h(
            WelcomeArticle,
            {
              title: "Don't loose your mnemonic",
              icon: 'mnemonic',
            },
            `A new wallet is created by generating a cryptographic set of words
            (mnemonic). You use it to access your funds on the Cardano blockchain.
            We don't store your mnemonic, and there is no way to reset it.
            If you lose your mnemonic, we cannot help you to restore the access
            to your funds.`
          ),
          h(
            WelcomeArticle,
            {
              title: 'Protect your funds',
              icon: 'funds',
            },
            `The mnemonic is handled in your browser and never leaves
            your computer. However, if a virus or a hacker compromises your
            computer, the attacker can steal the mnemonic you entered on
            the AdaLite website and access the funds.`
          ),
          h(
            WelcomeArticle,
            {
              title: 'Consider using a hardware wallet',
              icon: 'wallet',
            },
            `AdaLite allows you to access your funds using a hardware wallet. It
            currently supports Trezor model T. This allows you to interact with
            AdaLite in the safest manner possible without giving away your
            mnemonic. An attacker can't steal your mnemonic or private key since
            they don't leave Trezor.`
          ),
          h(
            WelcomeArticle,
            {
              title: "Don't get phished",
              icon: 'phishing',
            },
            `To protect yourself from phishers, bookmark official AdaLite address
            and `,
            h('b', undefined, 'always check the URL. The official address is https://adalite.io/.')
          )
        ),
        h(
          'div',
          {class: 'greeting-credits'},
          h(Branding, {dark: true}),
          h(
            'p',
            {class: 'credit-paragraph'},
            `AdaLite was not created by Cardano Foundation, Emurgo, or IOHK.
            This project was created with passion by Vacuumlabs. We appreciate
            any feedback, donation or contribution to the codebase.`
          )
        ),

        h(
          'div',
          {class: 'modal-footer greeting-footer'},
          h(
            'label',
            {class: 'label-wrapper'},
            h('input', {
              type: 'checkbox',
              checked: dontShowAgainCheckbox,
              onChange: this.checkboxClick,
              class: 'checkbox',
            }),
            "Don't show this notice again."
          ),
          h(
            'button',
            {
              onClick: this.toggleAboutOverlay,
              class: 'button primary wide modal-button',
              autofocus: true,
              onKeyDown: (e) => {
                e.key === 'Enter' && e.target.click()
                e.key === 'Tab' && e.preventDefault()
              },
            },
            'I understand, continue to the AdaLite'
          )
        )
      )
    )
  }
}

module.exports = connect(
  {},
  actions
)(AboutOverlayClass)
