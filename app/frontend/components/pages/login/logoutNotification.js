const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const Modal = require('../../common/modal')

class LogoutNotification {
  componentDidMount() {
    this.understandDemoBtn.focus()
  }

  render({setLogoutNotificationOpen}) {
    return h(
      Modal,
      {
        closeHandler: () => setLogoutNotificationOpen(false),
        title: 'You’ve been logged out',
        bodyClass: 'centered',
      },
      h('p', {class: 'modal-paragraph'}, 'We’ve logged you out after 15 minutes of inactivity.'),
      h(
        'div',
        {class: 'modal-footer'},
        h(
          'button',
          {
            class: 'button primary',
            onClick: () => setLogoutNotificationOpen(false),
            onKeyDown: (e) => {
              ;['Enter', 'Escape'].includes(e.key) && e.target.click()
            },
            ref: (element) => {
              this.understandDemoBtn = element
            },
          },
          'Continue'
        )
      )
    )
  }
}

module.exports = connect(
  {},
  actions
)(LogoutNotification)
