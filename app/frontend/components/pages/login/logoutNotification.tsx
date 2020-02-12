import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import Modal from '../../common/modal'

class LogoutNotification {
  understandDemoBtn: any

  componentDidMount() {
    this.understandDemoBtn.focus()
  }

  render({setLogoutNotificationOpen}) {
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
            ref={(element) => {
              this.understandDemoBtn = element
            }}
          >
            Continue
          </button>
        </div>
      </Modal>
    )
  }
}

export default connect(
  null,
  actions
)(LogoutNotification)
