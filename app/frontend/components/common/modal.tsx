/* eslint-disable react/no-deprecated */
import {h, Component} from 'preact'
import Tag from './tag'

interface Props {
  closeHandler: () => void
  children?: any
  bodyClass?: string
  title?: string
  showWarning?: boolean
}

class Modal extends Component<Props, {}> {
  componentWillMount() {
    document.body.classList.add('no-scroll')
  }

  componentWillUnmount() {
    document.body.classList.remove('no-scroll')
  }

  render({children, closeHandler, bodyClass = '', title = '', showWarning = false}) {
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
              'class': 'button close modal-close',
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

export default Modal
