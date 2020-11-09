import {h} from 'preact'
import {useState, useCallback} from 'preact/hooks'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import Modal from './modal'
import Alert from './alert'
import submitFeedbackToSentry from '../../helpers/submitFeedbackToSentry'

interface Props {
  sendSentry: any
  closeUnexpectedErrorModal: () => void
}

const UnexpectedErrorModal = ({sendSentry, closeUnexpectedErrorModal}: Props) => {
  const [userEmail, setEmail] = useState('')
  const [userName, setName] = useState('')
  const [userComments, setComments] = useState('')

  const closeAndResolve = useCallback(
    (shouldSend: boolean) => {
      const email = userEmail || 'user@email.com'
      const name = userName || 'user'
      if (shouldSend) {
        submitFeedbackToSentry(userComments, email, name, sendSentry.event.event_id)
        sendSentry.resolve({
          name,
          email,
          comment: userComments || 'no comment',
        })
      } else {
        sendSentry.resolve(false)
      }
      closeUnexpectedErrorModal()
    },
    [userComments, userEmail, userName, sendSentry, closeUnexpectedErrorModal]
  )
  const cancelAndClose = useCallback(() => closeAndResolve(false), [closeAndResolve])
  const sendAndClose = useCallback(() => closeAndResolve(true), [closeAndResolve])

  return (
    <Modal onRequestClose={cancelAndClose} title="Something went wrong.">
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
            onBlur={(e) => setName((e.target as HTMLInputElement).value)}
          />
          <input
            type="email"
            autoComplete="off"
            placeholder="Your email"
            className="input fullwidth"
            onBlur={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
        </div>
        <textarea
          placeholder="Your message"
          autoComplete="off"
          className="input fullwidth textarea"
          onBlur={(e) => setComments((e.target as HTMLTextAreaElement).value)}
        />
      </div>
      <Alert alertType="error event">{JSON.stringify(sendSentry.event)}</Alert>
      <div className="modal-footer send-error">
        <button className="button outline" onClick={cancelAndClose}>
          Cancel
        </button>
        <button className="button primary send-error" onClick={sendAndClose}>
          Send
        </button>
      </div>
    </Modal>
  )
}

export default connect(
  (state) => ({
    sendSentry: state.sendSentry,
  }),
  actions
)(UnexpectedErrorModal)
