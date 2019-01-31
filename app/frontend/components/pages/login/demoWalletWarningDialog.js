const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')
const Alert = require('../../common/alert')

class DemoWalletWarningDialogClass {
  componentDidMount() {
    this.understandDemoBtn.focus()
  }

  render({closeDemoWalletWarningDialog}) {
    return h(
      Modal,
      {
        closeHandler: closeDemoWalletWarningDialog,
        title: 'Accessing the demo wallet',
        showWarning: true,
      },
      h(
        'p',
        {class: 'modal-paragraph'},
        'You are about to access a publicly available wallet intended to show the public how AdaLite looks and works. ',
        h('strong', undefined, 'Your funds will not be safe here.')
      ),
      h(
        Alert,
        {alertType: 'error'},
        'All funds you will store to the demo wallet will be accessible to all AdaLite users. ',
        h('strong', undefined, 'Don’t store your ADA to the demo wallet!')
      ),
      h(
        'div',
        {class: 'modal-footer'},
        h(
          'button',
          {
            class: 'button primary',
            onClick: closeDemoWalletWarningDialog,
            onKeyDown: (e) => {
              ;['Enter', 'Escape'].includes(e.key) && e.target.click()
            },
            ref: (element) => {
              this.understandDemoBtn = element
            },
          },
          'Continue to the demo wallet'
        ),
        /* TODO: connect link click to creating new wallet action */
        h(
          'p',
          {class: 'modal-paragraph'},
          'To securely store ADA, ',
          h('a', {href: '/'}, 'create your new wallet')
        )
      )
    )
  }
}

module.exports = connect(
  {},
  actions
)(DemoWalletWarningDialogClass)
