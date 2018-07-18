const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const DemoWalletWarningDialog = connect(
  {},
  actions
)(({closeDemoWalletWarningDialog}) => {
  return h(
    'div',
    {class: 'overlay'},
    h(
      'div',
      {class: 'box center fade-in-up'},
      h('h4', undefined, 'Warning'),
      h(
        'p',
        undefined,
        'You are opening the demo wallet which is publicly available. Do NOT use this wallet to store funds!'
      ),
      h(
        'div',
        {class: 'box-button-wrapper'},
        h('button', {onClick: closeDemoWalletWarningDialog}, 'I understand')
      )
    )
  )
})

module.exports = DemoWalletWarningDialog
