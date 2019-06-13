/* eslint-disable react/no-deprecated */
const {h, Component} = require('preact')
const Tag = require('./tag')

class Modal extends Component {
  componentWillMount() {
    document.body.classList.add('no-scroll')
  }

  componentWillUnmount() {
    document.body.classList.remove('no-scroll')
  }

  render({children, closeHandler, bodyClass = '', title, showWarning}) {
    return h(
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
        h(
          'div',
          {
            class: 'modal-content',
          },
          closeHandler &&
            h('button', {
              'class': 'modal-close',
              'onClick': closeHandler,
              'aria-label': 'Close dialog',
            }),
          title &&
            h(
              'div',
              {class: 'modal-head'},
              title && h('h2', {class: 'modal-title'}, title),
              showWarning && h(Tag, {type: 'big warning', text: 'Proceed with caution'})
            ),
          children
        )
      )
    )
  }
}

module.exports = Modal
