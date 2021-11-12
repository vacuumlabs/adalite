import {h} from 'preact'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'
import {useEffect, useRef} from 'preact/hooks'
import {sessionStorageVars} from '../../../sessionStorage'

const LogoutNotification = (): h.JSX.Element => {
  const {closeLogoutNotification} = useActions(actions)
  const understandBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    understandBtn.current.focus()

    if (window.sessionStorage.getItem(sessionStorageVars.INACTIVITY_LOGOUT)) {
      window.sessionStorage.removeItem(sessionStorageVars.INACTIVITY_LOGOUT)
    }
  }, [])

  return (
    <Modal
      onRequestClose={() => closeLogoutNotification()}
      title="You’ve been logged out"
      bodyClass="centered"
    >
      <p className="modal-paragraph">We’ve logged you out after 15 minutes of inactivity.</p>
      <div className="modal-footer">
        <button
          className="button primary"
          onClick={() => closeLogoutNotification()}
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
