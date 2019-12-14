import {h, Component} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import Modal from './modal'
import Alert from './alert'

interface Props {
  sendSentry: any
  closeUnexpectedErrorModal: () => void
  updateName: any
  updateEmail: any
  updateMessage: any
  submitUserFeedbackToSentry: () => void
}

class UnexpectedErrorModal extends Component<Props, {}> {
  constructor(props) {
    super(props)
    this.closeAndResolve = this.closeAndResolve.bind(this)
  }

  closeAndResolve(resolveValue) {
    this.props.sendSentry.resolve(resolveValue)
    this.props.closeUnexpectedErrorModal()
  }

  render({sendSentry}) {
    return (
      <Modal onRequestClose={() => this.closeAndResolve(false)} title="Something went wrong.">
        <div className="modal-section">
          <p className="instruction">Do you want to inform Adalite about this error?</p>
          <p className="instruction">Tell us what happened!</p>
        </div>
        <div className="contact-form">
          <div className="form-row">
            <input
              type="text"
              autoComplete="off"
              placeholder="Your name"
              className="input fullwidth"
              onBlur={(e) => {
                this.props.updateName(e)
              }}
            />
            <input
              type="email"
              autoComplete="off"
              placeholder="Your email"
              className="input fullwidth"
              onBlur={(e) => {
                this.props.updateEmail(e)
              }}
            />
          </div>
          <textarea
            placeholder="Your message"
            autoComplete="off"
            className="input fullwidth textarea"
            onBlur={(e) => {
              this.props.updateMessage(e)
            }}
          />
        </div>
        <Alert alertType="error event">{JSON.stringify(sendSentry.event)}</Alert>
        <div className="modal-footer send-error">
          <button className="button outline" onClick={() => this.closeAndResolve(false)}>
            Cancel
          </button>
          <button
            className="button primary send-error"
            onClick={() => {
              this.closeAndResolve(true)
              this.props.submitUserFeedbackToSentry()
            }}
          >
            Send
          </button>
        </div>
      </Modal>
    )
  }
}

export default connect(
  (state) => ({
    sendSentry: state.sendSentry,
  }),
  actions
)(UnexpectedErrorModal)
