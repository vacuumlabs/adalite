const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../actions')
const Modal = require('./modal')
const Alert = require('./alert')
// const {ADALITE_CONFIG} = require('../../config')

class UnexpectedErrorModal extends Component {
  constructor(props) {
    super(props)
    this.closeUnexpectedErrorModal = this.closeUnexpectedErrorModal.bind(this)
  }

  closeUnexpectedErrorModal() {
    this.props.closeUnexpectedErrorModal()
  }

  render({sendSentry}) {
    return h(
      Modal,
      {
        closeHandler: this.closeUnexpectedErrorModal,
        title: 'Something went wrong.',
      },
      h('p', {class: 'modal-paragraph'}, 'Do you wanna inform Adalite about this error? '),
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
            onClick: this.closeUnexpectedErrorModal,
          },
          'Cancel'
        ),
        h(
          'button',
          {
            class: 'button primary send-error',
            onClick: sendSentry.resolve(false),
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
