const {h} = require('preact')

const Modal = ({children, closeHandler, bodyClass = '', showCloseButton = false}) =>
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
      showCloseButton && h('div', {class: 'modal-close', onClick: closeHandler}),
      children
    )
  )

module.exports = Modal
