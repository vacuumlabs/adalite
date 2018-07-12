const {h} = require('preact')
const connect = require('unistore/preact').connect

const AddressDetailDialog = require('./addressDetailDialog')
const AddressContainer = require('./addressContainer')

const OwnAddressesList = connect('ownAddressesWithMeta')(({ownAddressesWithMeta}) =>
  h(
    'div',
    {class: 'no-select'},
    h('h2', undefined, 'My Addresses'),
    ...ownAddressesWithMeta.map((adr) =>
      h(AddressContainer, {address: adr.address, bip32path: adr.bip32StringPath})
    ),
    h(AddressDetailDialog)
  )
)

const ReceiveAdaPage = () => h('div', {class: 'content-wrapper'}, h(OwnAddressesList))

module.exports = ReceiveAdaPage
