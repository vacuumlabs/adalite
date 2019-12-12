import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import AddressItem from './addressItem'

const MyAddresses = connect('ownAddressesWithMeta')(({ownAddressesWithMeta}) => (
  <div className="addresses card">
    <h2 className="card-title">My Addresses</h2>
    <div className="addresses-content">
      {ownAddressesWithMeta.map((adr) => (
        <AddressItem address={adr.address} bip32path={adr.bip32StringPath} />
      ))}
    </div>
  </div>
))

export default MyAddresses
