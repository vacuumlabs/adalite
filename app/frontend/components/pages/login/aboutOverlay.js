const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

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

  render({displayAboutOverlay, toggleAboutOverlay}, {dontShowAgainCheckbox}) {
    return displayAboutOverlay
      ? h(
        'div',
        {
          class: 'overlay',
          onKeyDown: (e) => {
            e.key === 'Escape' && this.toggleAboutOverlay()
          },
        },
        h('div', {
          class: 'overlay-close-layer',
          onClick: toggleAboutOverlay, // does not allow remembering the checkbox
        }),
        h(
          'div',
          {class: 'box'},
          h(
            'div',
            {class: 'message'},
            h('h4', {class: 'text-center strong'}, ' AdaLite is not a bank '),
            h(
              'p',
              undefined,
              h('b', undefined, 'AdaLite does not store your funds, mnemonic or private keys.'),
              ' We are an open-source client-side interface for direct interaction with the Cardano blockchain.'
            ),
            h(
              'p',
              undefined,
              `You create a new wallet by generating a cryptographic set of words (mnemonic)
              that are used to access your funds on the Cardano blockchain. The mnemonic is easy
              to write down and more comfortable to remember representation of the wallet's
              private key that is basically a root password for your wallet. `,
              h(
                'b',
                undefined,
                'If you lose your mnemonic, we cannot help you restore your funds.'
              )
            ),
            h(
              'p',
              undefined,
              `Each time you want to access your wallet (interact with the blockchain)
              through the AdaLite interface, you have to insert the mnemonic. `,
              h(
                'b',
                undefined,
                'Never share your mnemonic with anyone as it will allow them to access your funds!'
              )
            ),
            h(
              'p',
              undefined,
              'The mnemonic is handled in your browser and never leaves your computer. ',
              h(
                'b',
                undefined,
                `Nevertheless, if a virus or a hacker compromise your computer,
              the attacker can steal the mnemonic when entered on AdaLite and access your funds.`
              )
            ),
            h(
              'p',
              undefined,
              'Therefore AdaLite offers you also the option to use ',
              h(
                'a',
                {
                  href:
                      'https://shop.trezor.io/product/trezor-model-t?offer_id=15&aff_id=1071&source=Disclaimer',
                  target: '_blank',
                },
                'Trezor model T'
              ),
              '. ',
              h(
                'b',
                undefined,
                `Trezor is a hardware wallet that will allow you to store your
                mnemonic and private keys safely and interact with AdaLite in the safest possible
                manner, without giving away to AdaLite's interface your mnemonic nor root private key.`
              ),
              ` Your private key will never leave the Trezor. Therefore an attacker can’t steal
              them and gain control over your wallet.`
            ),
            h(
              'p',
              undefined,
              'To protect yourself from phishers, bookmark the official AdaLite address and always check the URL ',
              h('code', undefined, h('u', undefined, 'https://adalite.io/')),
              '.'
            ),
            h(
              'p',
              undefined,
              'AdaLite was not created by Cardano Foundation, Emurgo, or IOHK. This project was created with passion by ',
              h('a', {href: 'https://vacuumlabs.com/', target: '_blank'}, 'Vacuum Labs'),
              '. We appreciate any feedback, donation or contribution to the ',
              h(
                'a',
                {href: 'https://github.com/vacuumlabs/adalite/', target: '_blank'},
                'codebase'
              ),
              '.'
            )
          ),
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
              'I understand the risk and do not wish to be shown this screen again'
            )
          ),
          h(
            'span',
            {class: 'centered-row'},
            h(
              'button',
              {
                onClick: this.toggleAboutOverlay,
                class: 'rounded-button',
                autofocus: true,
                onKeyDown: (e) => {
                  e.key === 'Enter' && e.target.click()
                  e.key === 'Tab' && e.preventDefault()
                },
              },
              'Close'
            )
          )
        )
      )
      : null
  }
}

module.exports = connect(
  'displayAboutOverlay',
  actions
)(AboutOverlayClass)
