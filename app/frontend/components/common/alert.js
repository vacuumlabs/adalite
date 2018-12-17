const {h} = require('preact')

const Alert = ({children, alertType = 'success', bodyClass = ''}) =>
  h(
    'div',
    {
      class: `alert ${alertType} ${bodyClass}`,
    },
    h('div', {class: 'alert-content'}, children)
  )

module.exports = Alert
