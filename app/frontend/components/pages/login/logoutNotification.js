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
      },
      h(
        'div',
        {class: 'center'},
        h('h4', undefined, 'Notification'),
        h('p', undefined, 'You were logged out due to inactivity.'),
        h(
          'div',
          {class: 'box-button-wrapper'},
          h(
            'button',
            {
              onClick: () => setLogoutNotificationOpen(false),
              onKeyDown: (e) => {
                ;['Enter', 'Escape'].includes(e.key) && e.target.click()
              },
              ref: (element) => {
                this.understandDemoBtn = element
              },
            },
            'I understand'
          )
        )
      )
    )
  }
}

module.exports = connect(
  {},
  actions
)(LogoutNotification)
