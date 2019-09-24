const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../actions')
const Modal = require('./modal')
const Alert = require('./alert')

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
          class: 'contact-form',
        },
        h('p', {class: 'instructions'}, 'Do you want to inform Adalite about this error?'),
        h('p', {class: 'instructions'}, 'Tell us what happened!'),
        h(
          'div',
          {
            class: 'form-row',
          },
          h('input', {
            type: 'text',
            autocomplete: 'off',
            placeholder: 'Your name',
            name: 'name',
            class: 'input fullwidth',
            required: true,
            onBlur: (e) => {
              this.props.updateName(e)
            },
          }),
          h('input', {
            type: 'email',
            autocomplete: 'off',
            placeholder: 'Your email',
            name: '_replyto',
            class: 'input fullwidth',
            required: true,
            onBlur: (e) => {
              this.props.updateEmail(e)
            },
          })
        ),
        h('textarea', {
          placeholder: 'Your message',
          autocomplete: 'off',
          name: 'message',
          class: 'input fullwidth textarea',
          required: true,
          onBlur: (e) => {
            this.props.updateMessage(e)
          },
        })
      ),
      h(
        Alert,
        {
          alertType: 'error',
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
            onClick: () => this.closeAndResolve(true),
          },
          'Send'
        )
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    sendSentry: state.sendSentry,
  }),
  actions
)(UnexpectedErrorModal)
