import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import Modal from '../../common/modal'

class LogoutNotification {
  understandDemoBtn: any

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
              ;['Enter', 'Escape'].includes(e.key) && (e.target as HTMLButtonElement).click()
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

export default connect(
  {},
  actions
)(LogoutNotification)
