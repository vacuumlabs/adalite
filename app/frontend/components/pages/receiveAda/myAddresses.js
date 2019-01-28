const {h} = require('preact')
const connect = require('unistore/preact').connect
const AddressItem = require('./addressItem')

const MyAddresses = connect('ownAddressesWithMeta')(({ownAddressesWithMeta}) =>
  h(
    'div',
    {class: 'addresses card'},
    h('h2', {class: 'card-title'}, 'My Addresses'),
    h(
      'div',
      {class: 'addresses-content'},
      ...ownAddressesWithMeta.map((adr) =>
        h(AddressItem, {address: adr.address, bip32path: adr.bip32StringPath})
      )
    ),
    /* TODO: Implement View all addresses functionality */
    h('button', {class: 'button view-more'}, 'View all addresses')
  )
)

module.exports = MyAddresses
