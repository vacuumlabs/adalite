const {h} = require('preact')
const Tag = require('./tag')

const Modal = ({children, closeHandler, bodyClass = '', title, showWarning}) =>
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
      h(
        'div',
        {class: 'modal-head'},
        title && h('h2', {class: 'modal-title'}, title),
        showWarning && h(Tag, {type: 'big warning', text: 'Proceed with caution'})
      ),
      children
    )
  )

module.exports = Modal
