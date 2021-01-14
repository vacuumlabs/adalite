import {State, activeAccountState} from '../../../../frontend/state'
import {h} from 'preact'
import {useSelector} from '../../../helpers/connect'
import AddressItem from './addressItem'

const MyAddresses = () => {
  const addresses = useSelector((state: State) => activeAccountState(state).visibleAddresses)

  return (
    <div className="addresses card">
      <h2 className="card-title">My Addresses</h2>
      <div className="addresses-content">
        {addresses.map((adr) => (
          <AddressItem key={adr.address} address={adr.address} bip32path={adr.bip32StringPath} />
        ))}
      </div>
    </div>
  )
}

export default MyAddresses
