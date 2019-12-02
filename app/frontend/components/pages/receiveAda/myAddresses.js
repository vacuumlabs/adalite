import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import AddressItem from './addressItem'

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
    )
  )
)

export default MyAddresses
