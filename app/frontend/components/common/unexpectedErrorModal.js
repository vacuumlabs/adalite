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
      h('p', {class: 'modal-paragraph'}, 'Do you want to inform Adalite about this error? '),
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
            onClick: () => {
              this.props.submitUserFeedbackToSentry()
              this.closeAndResolve(true)
            },
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
