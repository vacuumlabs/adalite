const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')

class DemoWalletWarningDialogClass {
  componentDidMount() {
    this.understandDemoBtn.focus()
  }

  render({closeDemoWalletWarningDialog}) {
    return h(
      Modal,
      {closeHandler: closeDemoWalletWarningDialog},
      h(
        'div',
        {class: 'center'},
        h('h4', undefined, 'Warning'),
        h(
          'p',
          undefined,
          'You are opening the demo wallet which is publicly available. Do NOT use this wallet to store funds!'
        ),
        h(
          'div',
          {class: 'box-button-wrapper'},
          h(
            'button',
            {
              onClick: closeDemoWalletWarningDialog,
              onKeyDown: (e) => {
                ;['Enter', 'Escape'].includes(e.key) && e.target.click()
              },
              ref: (element) => {
                this.understandDemoBtn = element
              },
            },
            'I understand'
          )
        )
      )
    )
  }
}

module.exports = connect(
  {},
  actions
)(DemoWalletWarningDialogClass)
