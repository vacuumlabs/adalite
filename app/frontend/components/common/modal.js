const {h} = require('preact')

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
      closeHandler &&
        h('button', {'class': 'modal-close', 'onClick': closeHandler, 'aria-label': 'Close dialog'}),
      children
    )
  )

module.exports = Modal
