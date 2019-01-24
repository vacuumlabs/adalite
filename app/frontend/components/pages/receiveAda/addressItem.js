const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const CopyOnClick = require('../../common/copyOnClick')

const AddressItem = connect(
  {},
  actions
)(({address, bip32path, openAddressDetail}) =>
  h(
    'div',
    {class: 'address'},
    h('p', {class: 'address-value'}, address),
    h(
      'div',
      {class: 'address-links'},
      h(
        'a',
        {
          class: 'address-link',
          href: `https://adascan.net/address/${address}`,
          target: '_blank',
          rel: 'noopener',
        },
        'View on AdaScan'
      ),
      h(
        'a',
        {
          class: 'address-link qr',
          onClick: () => openAddressDetail({address, bip32path}),
        },
        'View QR Code'
      ),
      h(CopyOnClick, {
        value: address,
        elementClass: 'address-link',
        text: 'Copy Address',
      })
    )
  )
)

module.exports = AddressItem
