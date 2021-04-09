import {h} from 'preact'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import {useEffect, useRef} from 'preact/hooks'

const LogoutNotification = (): h.JSX.Element => {
  const {setLogoutNotificationOpen} = useActions(actions)
  const understandBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    understandBtn.current.focus()
  }, [])

  return (
    <Modal
      onRequestClose={() => setLogoutNotificationOpen(false)}
      title="You’ve been logged out"
      bodyClass="centered"
    >
      <p className="modal-paragraph">We’ve logged you out after 15 minutes of inactivity.</p>
      <div className="modal-footer">
        <button
          className="button primary"
          onClick={() => setLogoutNotificationOpen(false)}
          onKeyDown={(e) => {
            ;['Enter', 'Escape'].includes(e.key) && (e.target as HTMLButtonElement).click()
          }}
          ref={understandBtn}
        >
          Continue
        </button>
      </div>
    </Modal>
  )
}

export default LogoutNotification
