const {h} = require('preact')

const Alert = ({children, alertType = 'success'}) =>
  h(
    'div',
    {
      class: `alert ${alertType}`,
    },
    h('div', {class: 'alert-content'}, children)
  )

module.exports = Alert
