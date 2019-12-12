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
    return (
      <div className="modal">
        <div className="modal-overlay" onClick={closeHandler} />
        <div
          className={`modal-body ${bodyClass}`}
          onKeyDown={(e) => {
            e.key === 'Escape' && closeHandler()
          }}
        >
          <div className="modal-content">
            {closeHandler && (
              <button
                className="button close modal-close"
                onClick={closeHandler}
                ariaLabel="Close dialog"
              />
            )}
            {title && (
              <div className="modal-head">
                {title && <h2 className="modal-title">{title}</h2>}
                {showWarning && <Tag type="big warning" text="Proceed with caution" />}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
