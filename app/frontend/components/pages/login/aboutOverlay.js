const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')

const WelcomeRecommendation = ({children, title, containerClass, iconPath}) =>
  h(
    'div',
    containerClass ? {class: containerClass} : undefined,
    h('img', {class: 'welcomeModal__section__image', src: iconPath}),
    h('h5', {class: 'welcomeModal__section__title'}, title),
    h('p', {class: 'welcomeModal__section__text'}, children)
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
        'div',
        {class: 'message'},
        h(
          'div',
          {class: 'modal__head welcomeModal__head'},
          h('h3', {class: 'modal__heading'}, 'Welcome to AdaLite'),
          h(
            'h4',
            {class: 'modal__subHeading'},
            'We are an open-source client-side interface for direct interaction with the Cardano blockchain.'
          ),

          h(
            'div',
            {class: 'alert alert--warning'},
            h('img', {class: 'alert__image', src: ''}),
            h(
              'p',
              undefined,
              'To be safe from losing access to your funds, please read the following advice carefully.'
            )
          )
        ),
        h(
          'div',
          {class: 'welcomeModal__content'},
          h(
            WelcomeRecommendation,
            {
              title: "Don't loose your mnemonic",
              // TODO iconPath: 'assets/mnemonic-icon.svg',
            },
            `A new wallet is created by generating a cryptographic set of words
            (mnemonic). You use it to access your funds on the Cardano blockchain.
            We don't store your mnemonic, and there is no way to reset it.
            If you lose your mnemonic, we cannot help you to restore the access
            to your funds.`
          ),
          h(
            WelcomeRecommendation,
            {
              title: 'Protect your funds',
              // TODO iconPath: 'assets/shield-icon.svg',
            },
            `The mnemonic is handled in your browser and never leaves
            your computer. However, if a virus or a hacker compromises your
            computer, the attacker can steal the mnemonic you entered on
            the AdaLite website and access the funds.`
          ),
          h(
            WelcomeRecommendation,
            {
              title: 'Consider using a hardware wallet',
              // TODO iconPath: 'assets/lock-icon.svg',
            },
            `AdaLite allows you to access your funds using a hardware wallet. It
            currently supports Trezor model T. This allows you to interact with
            AdaLite in the safest manner possible without giving away your
            mnemonic. An attacker can't steal your mnemonic or private key since
            they don't leave Trezor.`
          ),
          h(
            WelcomeRecommendation,
            {
              title: "Don't get phished",
              // TODO iconPath: 'assets/bookmark-icon.svg',
            },
            `To protect yourself from phishers, bookmark official AdaLite address
            and `,
            h('b', undefined, 'always check the URL. The official address is https://adalite.io/.')
          )
        ),

        h(
          'div',
          {class: 'welcomeModal__credits'},
          h('img', {class: 'welcomeModal__credits__image', src: 'assets/vacuumlabs-logo.svg'}),
          h(
            'p',
            {class: 'welcomeModal__credits__text'},
            `AdaLite was not created by Cardano Foundation, Emurgo, or IOHK.
            This project was created with passion by Vacuumlabs. We appreciate
            any feedback, donation or contribution to the codebase.`
          )
        ),

        h(
          'div',
          {class: 'welcomeModal__footer'},
          h(
            'div',
            undefined,
            h(
              'label',
              {class: 'centered-row action'},
              h('input', {
                type: 'checkbox',
                checked: dontShowAgainCheckbox,
                onChange: this.checkboxClick,
                class: 'understand-checkbox',
              }),
              "Don't show this notice again."
            )
          ),
          h(
            'button',
            {
              onClick: this.toggleAboutOverlay,
              class: 'welcomeModal__footer__submit button button--primary button--wide',
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
