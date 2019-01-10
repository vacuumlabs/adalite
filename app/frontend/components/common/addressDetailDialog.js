const {h, Component} = require('preact')
const QRious = require('../../libs/qrious')
const connect = require('unistore/preact').connect
const actions = require('../../actions')

const Modal = require('./modal')

class AddressDetailDialogClass extends Component {
  render({showDetail, closeAddressDetail}) {
    return (
      showDetail &&
      h(
        Modal,
        {
          closeHandler: closeAddressDetail,
          bodyClass: 'narrow',
        },
        h(
          'div',
          {class: 'address-qr'},
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
  }
}

module.exports = connect(
  (state) => ({
    showDetail: state.showAddressDetail,
  }),
  actions
)(AddressDetailDialogClass)
