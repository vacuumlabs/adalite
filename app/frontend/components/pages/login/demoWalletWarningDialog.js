import {h} from 'preact'
import {connect} from 'unistore/preact'
import actions from '../../../actions'
import Modal from '../../common/modal'
import Alert from '../../common/alert'

class DemoWalletWarningDialogClass {
  render({closeDemoWalletWarningDialog}) {
    return h(
      Modal,
      {
        closeHandler: closeDemoWalletWarningDialog,
        title: 'Accessing the demo wallet',
        showWarning: true,
      },
      h(
        'p',
        {class: 'modal-paragraph'},
        'You are about to access a publicly available wallet intended to show the public how AdaLite looks and works. ',
        h('strong', undefined, 'Your funds will not be safe here.')
      ),
      h(
        Alert,
        {alertType: 'error'},
        'All funds you will store to the demo wallet will be accessible to all AdaLite users. ',
        h('strong', undefined, 'Don’t store your ADA to the demo wallet!')
      ),
      h(
        'div',
        {class: 'modal-footer'},
        h(
          'button',
          {
            class: 'button primary',
            onClick: closeDemoWalletWarningDialog,
            onKeyDown: (e) => {
              ;['Enter', 'Escape'].includes(e.key) && e.target.click()
            },
          },
          'Continue to the demo wallet'
        ),
        /* TODO: connect link click to creating new wallet action */
        h(
          'p',
          {class: 'modal-paragraph'},
          'To securely store ADA, ',
          h('a', {href: '/'}, 'create your new wallet')
        )
      )
    )
  }
}

export default connect(
  {},
  actions
)(DemoWalletWarningDialogClass)
