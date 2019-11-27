import {h, Component} from 'preact'
import * as QRious from '../../libs/qrious'
import {connect} from '../../libs/unistore/preact'
import actions from '../../actions'

import Modal from './modal'
import CopyOnClick from './copyOnClick'

interface Props {
  showDetail: any
  closeAddressDetail: (state: any) => void
  verificationError: boolean
  verifyAddress: () => void
  showVerification: boolean
  hwWalletName: string
  waitingForHwWallet: boolean
}

class AddressDetailDialogClass extends Component<Props, {showCopyMessage: boolean}> {
  constructor(props) {
    super(props)
    this.state = {showCopyMessage: false}
    this.toggleCopyMessage = this.toggleCopyMessage.bind(this)
  }

  toggleCopyMessage(copied) {
    this.setState({showCopyMessage: copied})
  }

  render(
    {
      showDetail,
      closeAddressDetail,
      verificationError,
      verifyAddress,
      showVerification,
      hwWalletName,
      waitingForHwWallet,
    },
    {showCopyMessage}
  ) {
    return (
      showDetail &&
      h(
        Modal,
        {
          closeHandler: closeAddressDetail,
        },
        h(
          'div',
          {class: 'detail'},
          h(
            'div',
            {class: 'detail-content'},
            h('div', {class: 'detail-label'}, 'Address'),
            h(
              'div',
              {class: 'detail-input address'},
              h(
                CopyOnClick,
                {
                  value: showDetail.address,
                  copy: showDetail.copyOnClick,
                },
                h('div', {class: 'detail-address'}, showDetail.address)
              ),
              h(
                CopyOnClick,
                {
                  value: showDetail.address,
                  elementClass: 'address-copy copy',
                  copiedCallback: this.toggleCopyMessage,
                  enableTooltip: false,
                },
                h('span', {class: 'copy-text'}, '')
              ),
              showCopyMessage && h('span', {class: 'detail-copy-message'}, 'Copied to clipboard')
            ),
            h('div', {class: 'detail-label'}, 'Derivation path'),
            h(
              'div',
              {class: 'detail-row'},
              h(
                'div',
                {class: 'detail-input'},
                h('div', {class: 'detail-derivation'}, showDetail.bip32path)
              ),
              showVerification &&
                (verificationError
                  ? h(
                    'div',
                    {class: 'detail-error'},
                    h(
                      'div',
                      undefined,
                      'Verification failed. ',
                      h(
                        'a',
                        {
                          href: '#',
                          class: 'detail-verify',
                          onClick: (e) => {
                            e.preventDefault()
                            verifyAddress()
                          },
                        },
                        'Try again'
                      )
                    )
                  )
                  : h(
                    'a',
                    {
                      href: '#',
                      class: 'detail-verify',
                      onClick: (e) => {
                        e.preventDefault()
                        !waitingForHwWallet && verifyAddress()
                      },
                    },
                    waitingForHwWallet ? 'Verifying address..' : `Verify on ${hwWalletName}`
                  ))
            )
          ),
          h(
            'div',
            {class: 'detail-qr'},
            h('img', {
              src: new QRious({
                value: showDetail.address,
                level: 'M',
                size: 200,
              }).toDataURL(),
            })
          )
        )
      )
    )
  }
}

export default connect(
  (state) => ({
    showDetail: state.showAddressDetail,
    verificationError: state.addressVerificationError,
    showVerification: state.showAddressVerification,
    waitingForHwWallet: state.waitingForHwWallet,
    hwWalletName: state.hwWalletName,
  }),
  actions
)(AddressDetailDialogClass)
