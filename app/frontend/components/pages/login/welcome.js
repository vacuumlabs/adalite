const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')
const Alert = require('../../common/alert')
const Branding = require('../../common/branding')

const Article = ({children, title, icon}) =>
  h(
    'article',
    {class: 'article'},
    h('span', {class: `article-icon ${icon ? `${icon}` : ''}`}),
    h('h3', {class: 'article-title'}, title),
    h('p', {class: 'article-paragraph'}, children)
  )

const Credits = () =>
  h(
    'section',
    {class: 'credits'},
    h(Branding, {dark: true}),
    h(
      'p',
      {class: 'credits-paragraph'},
      `AdaLite was not created by Cardano Foundation, Emurgo, or IOHK.
    This project was created with passion by Vacuumlabs. We appreciate
    any feedback, donation or contribution to the codebase.`
    )
  )

class Welcome extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dontShowAgainCheckbox: false,
    }
    this.checkboxClick = this.checkboxClick.bind(this)
    this.closeWelcome = this.closeWelcome.bind(this)
  }

  checkboxClick() {
    this.setState({dontShowAgainCheckbox: !this.state.dontShowAgainCheckbox})
  }

  closeWelcome() {
    this.props.closeWelcome(this.state.dontShowAgainCheckbox)
  }

  render({closeWelcome}, {dontShowAgainCheckbox}) {
    return h(
      Modal,
      undefined,
      h(
        'section',
        {class: 'welcome'},
        h('h2', {class: 'welcome-title'}, 'Welcome to AdaLite'),
        h(
          'p',
          {class: 'welcome-subtitle'},
          'We are an open-source client-side interface for direct \n interaction with the Cardano blockchain.'
        ),
        h(
          Alert,
          {alertType: 'warning'},
          'To be safe from losing access to your funds, please read the following advice carefully.'
        ),
        h(
          'div',
          {class: 'welcome-articles'},
          h(
            Article,
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
            Article,
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
            Article,
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
            Article,
            {
              title: "Don't get phished",
              icon: 'phishing',
            },
            `To protect yourself from phishers, bookmark official AdaLite address
            and `,
            h('b', undefined, 'always check the URL. The official address is https://adalite.io/.')
          )
        ),
        h(Credits),
        h(
          'div',
          {class: 'welcome-footer'},
          h(
            'label',
            {class: 'checkbox'},
            h('input', {
              type: 'checkbox',
              checked: dontShowAgainCheckbox,
              onChange: this.checkboxClick,
              class: 'checkbox-input',
            }),
            h('span', {class: 'checkbox-indicator'}, undefined),
            "Don't show this notice again."
          ),
          h(
            'button',
            {
              onClick: this.closeWelcome,
              class: 'button primary wide modal-button',
              onKeyDown: (e) => {
                e.key === 'Enter' && e.target.click()
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
)(Welcome)
