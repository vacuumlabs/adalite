import {h, Component} from 'preact'
import {connect} from '../../libs/unistore/preact'
import actions from '../../actions'
import Modal from './modal'
import Alert from './alert'

class UnexpectedErrorModal extends Component {
  constructor(props) {
    super(props)
    this.closeAndResolve = this.closeAndResolve.bind(this)
  }

  closeAndResolve(resolveValue) {
    this.props.sendSentry.resolve(resolveValue)
    this.props.closeUnexpectedErrorModal()
  }

  render({sendSentry}) {
    return h(
      Modal,
      {
        closeHandler: () => this.closeAndResolve(false),
        title: 'Something went wrong.',
      },
      h(
        'div',
        {
          class: 'modal-section',
        },
        h('p', {class: 'instruction'}, 'Do you want to inform Adalite about this error?'),
        h('p', {class: 'instruction'}, 'Tell us what happened!')
      ),
      h(
        'div',
        {
          class: 'contact-form',
        },
        h(
          'div',
          {
            class: 'form-row',
          },
          h('input', {
            type: 'text',
            autocomplete: 'off',
            placeholder: 'Your name',
            class: 'input fullwidth',
            onBlur: (e) => {
              this.props.updateName(e)
            },
          }),
          h('input', {
            type: 'email',
            autocomplete: 'off',
            placeholder: 'Your email',
            class: 'input fullwidth',
            onBlur: (e) => {
              this.props.updateEmail(e)
            },
          })
        ),
        h('textarea', {
          placeholder: 'Your message',
          autocomplete: 'off',
          class: 'input fullwidth textarea',
          onBlur: (e) => {
            this.props.updateMessage(e)
          },
        })
      ),
      h(
        Alert,
        {
          alertType: 'error event',
        },
        JSON.stringify(sendSentry.event)
      ),
      h(
        'div',
        {class: 'modal-footer send-error'},
        h(
          'button',
          {
            class: 'button outline',
            onClick: () => this.closeAndResolve(false),
          },
          'Cancel'
        ),
        h(
          'button',
          {
            class: 'button primary send-error',
            onClick: () => {
              this.closeAndResolve(true)
              this.props.submitUserFeedbackToSentry()
            },
          },
          'Send'
        )
      )
    )
  }
}

export default connect(
  (state) => ({
    sendSentry: state.sendSentry,
  }),
  actions
)(UnexpectedErrorModal)
