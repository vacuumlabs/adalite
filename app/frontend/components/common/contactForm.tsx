import {h, Component} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import Modal from './modal'
import {ADALITE_CONFIG} from '../../config'

interface Props {
  closeContactFormModal: () => void
}

class ContactForm extends Component<Props, {submitted: boolean}> {
  contactForm: HTMLFormElement | null

  constructor(props) {
    super(props)
    this.closeContactFormModal = this.closeContactFormModal.bind(this)

    this.state = {
      submitted: false,
    }
  }

  closeContactFormModal() {
    if (this.contactForm) {
      this.contactForm.reset()
    }
    this.props.closeContactFormModal()
  }

  render() {
    return (
      <Modal onRequestClose={this.closeContactFormModal}>
        <main className="contact-modal">
          <h2 className="export-title">Contact Us</h2>
          <p className="instructions">
            <span>If you are experiencing problems, please try the following </span>
            <a
              href="https://github.com/vacuumlabs/adalite/wiki/Troubleshooting"
              target="_blank"
              rel="noopener"
            >
              troubleshooting suggestions
            </a>
            <span> before contacting us. You can also reach us out via </span>
            <a href={'mailto:info@adalite.io'}>info@adalite.io</a>
            <span>.</span>
          </p>
          <form
            className="contact-form"
            id="contactForm"
            method="POST"
            target="_blank"
            action={`//formspree.io/${ADALITE_CONFIG.ADALITE_SUPPORT_EMAIL}`}
            onSubmit={() => {
              this.setState({submitted: true})
            }}
            ref={(element) => {
              this.contactForm = element
            }}
          >
            <div className="form-row">
              <input
                type="text"
                autoComplete="off"
                placeholder="Your name"
                name="name"
                className="input fullwidth"
                required
              />
              <input
                type="email"
                autoComplete="off"
                placeholder="Your email"
                name="_replyto"
                className="input fullwidth"
                required
              />
            </div>
            <textarea
              placeholder="Your message"
              autoComplete="off"
              name="message"
              className="input fullwidth textarea"
              required
            />
            {this.state.submitted && (
              <div className="form-alert success">
                Thank you for your message. We will contact you shortly.
              </div>
            )}
            <input type="text" name="_gotcha" style="display:none" />
            <div className="contact-form-bottom">
              <button
                onClick={this.closeContactFormModal}
                className="button secondary"
                type="button"
                onKeyDown={(e) => {
                  e.key === 'Enter' && (e.target as HTMLButtonElement).click()
                }}
              >
                Back to AdaLite
              </button>
              <input
                className="button primary wide modal-button submit"
                value="Submit"
                type="submit"
              />
            </div>
          </form>
          <button
            onClick={this.closeContactFormModal}
            className="button close modal-close"
            {
            ...{ariaLabel: 'Close dialog'} /* to mute ts error */
            }
            onKeyDown={(e) => {
              e.key === 'Enter' && (e.target as HTMLButtonElement).click()
            }}
          />
        </main>
      </Modal>
    )
  }
}

export default connect(null, actions)(ContactForm)
