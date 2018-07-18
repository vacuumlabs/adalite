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
        {class: 'overlay'},
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
            h('h4', undefined, ' Disclaimer: CardanoLite is not created by Cardano Foundation. '),
            h(
              'p',
              undefined,
              `The official Cardano team did not review this code and is not responsible for any damage
        it may cause you. The CardanoLite project is in alpha stage and should be used for
        penny-transactions only. We appreciate feedback, especially review of the crypto-related code.`
            ),
            h('h4', {class: 'header-margin'}, ' CardanoLite is not a bank '),
            h(
              'p',
              undefined,
              `
        It does not really store your funds permanently - each
        time you interact with it, you have to insert the mnemonic - the 12-words long root password
        to your account. If you lose it, we cannot help you restore the funds.
      `
            ),
            h('p', undefined, 'Feedback and contributions are very welcome.')
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
