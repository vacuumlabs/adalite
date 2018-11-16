const {h} = require('preact')
const {CloseIcon} = require('./svg')

const Modal = ({children, closeHandler, bodyClass = ''}) =>
  h(
    'div',
    {
      class: 'modal',
    },
    h('div', {
      class: 'modal-overlay',
      onClick: closeHandler,
    }),
    h(
      'div',
      {
        class: `modal-body ${bodyClass}`,
        onKeyDown: (e) => {
          e.key === 'Escape' && closeHandler()
        },
      },
      h('span', {class: 'modal-close-button', onClick: closeHandler}, h(CloseIcon)),
      children
    )
  )

module.exports = Modal
