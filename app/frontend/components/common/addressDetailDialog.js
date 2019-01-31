const {h, Component} = require('preact')
const QRious = require('../../libs/qrious')
const connect = require('unistore/preact').connect
const actions = require('../../actions')

const Tooltip = require('./tooltip')
const Modal = require('./modal')
const CopyOnClick = require('./copyOnClick')

class AddressDetailDialogClass extends Component {
  componentDidUpdate() {
    this.props.showDetail && this.copyBtn && this.copyBtn.focus()
    // known bug: Trezor emulator steals the focus
  }

  render({
    showDetail,
    showVerification,
    error,
    verifyAddress,
    closeAddressDetail,
    hwWalletName,
    waitingForHwWallet,
  }) {
    return (
      showDetail &&
      h(
        Modal,
        {
          closeHandler: closeAddressDetail,
        },
        h('b', undefined, 'Address:'),
        h(
          'div',
          {class: 'full-address-row'},
          h(
            'span',
            {
              class: 'full-address force-select-all',
            },
            showDetail.address
          )
        ),
        showVerification
          ? h(
            'div',
            undefined,
            h('b', undefined, 'Derivation path:'),
            h(
              'div',
              {class: 'full-address-row'},
              h('span', {class: 'full-address'}, showDetail.bip32path)
            ),
            h(
              'div',
              {class: 'text-center'},
              h(
                'button', {
                  class: `${waitingForHwWallet ? 'waiting-for-hw-wallet-button' : ''}`,
                  onClick: verifyAddress,
                },
                h('div', {
                  class: `${waitingForHwWallet ? 'loading-inside-button' : ''}`,
                }),
                `Verify on ${hwWalletName}`)
            )
          )
          : h(
            'div',
            undefined,
            h(
              'div',
              {class: 'centered-row'},
              h('img', {
                src: new QRious({
                  value: showDetail.address,
                  level: 'M',
                  size: 200,
                }).toDataURL(),
              })
            ),
            h(
              'div',
              {class: 'centered-row'},
              h(CopyOnClick, {
                value: showDetail.address,
                tabIndex: 0,
                copyBtnRef: (element) => {
                  this.copyBtn = element
                },
              }),
              h(
                Tooltip,
                {tooltip: 'Examine via AdaScan.net'},
                h(
                  'a',
                  {
                    href: `https://adascan.net/address/${showDetail.address}`,
                    target: '_blank',
                    class: 'address-link margin-1rem centered-row',
                    tabIndex: 0,
                    onKeyDown: (e) => {
                      e.key === 'Enter' && e.target.click()
                      if (e.key === 'Tab') {
                        this.copyBtn.focus()
                        e.preventDefault()
                      }
                    },
                  },
                  h('img', {src: 'assets/link-icon.svg'})
                )
              )
            )
          )
      )
    )
  }
}

module.exports = connect(
  (state) => ({
    showDetail: state.showAddressDetail,
    showVerification: state.showAddressVerification,
    error: state.addressVerificationError,
    hwWalletName: state.hwWalletName,
    waitingForHwWallet: state.waitingForHwWallet,
  }),
  actions
)(AddressDetailDialogClass)
