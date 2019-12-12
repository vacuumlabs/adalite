import {h} from 'preact'
import {connect} from '../../../helpers/connect'
import AddressItem from './addressItem'

const _MyAddresses = ({ownAddressesWithMeta}) => (
  <div className="addresses card">
    <h2 className="card-title">My Addresses</h2>
    <div className="addresses-content">
      {ownAddressesWithMeta.map((adr) => (
        <AddressItem address={adr.address} bip32path={adr.bip32StringPath} />
      ))}
    </div>
  </div>
)


const MyAddresses = connect((state) => ({ownAddressesWithMeta: state.ownAddressesWithMeta}))(_MyAddresses)

export default MyAddresses
