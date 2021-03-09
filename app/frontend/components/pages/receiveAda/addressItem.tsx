import {Fragment, h} from 'preact'
import {ADALITE_CONFIG} from '../../../config'
import CopyOnClick from '../../common/copyOnClick'
import AddressVerification from '../../common/addressVerification'
import * as QRious from '../../../libs/qrious'
import ViewAddressOn from './viewAddressOn'
import {DropdownCaret} from '../../common/svg'

interface Props {
  address: string
  bip32path: string
  isExpanded: boolean
  expand: () => void
}

const AddressItem = ({address, bip32path, isExpanded, expand}: Props): h.JSX.Element => {
  const explorerLinksInline = (
    <div>
      {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'byron' && (
        <Fragment>
          <ViewAddressOn
            name="Blockchair"
            url={`https://blockchair.com/cardano/address/${address}`}
          />
          {' | '}
          <ViewAddressOn name="AdaScan" url={`https://adascan.net/address/${address}`} inline />
        </Fragment>
      )}
      {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
        <Fragment>
          <ViewAddressOn name="CardanoScan" url={`https://cardanoscan.io/address/${address}`} />
          {' | '}
          <ViewAddressOn name="ADAex" url={`https://adaex.org/${address}`} inline />
        </Fragment>
      )}
    </div>
  )

  const explorerLinks = (
    <Fragment>
      {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'byron' && (
        <Fragment>
          <ViewAddressOn
            name="Blockchair"
            url={`https://blockchair.com/cardano/address/${address}`}
          />
          <ViewAddressOn name="AdaScan" url={`https://adascan.net/address/${address}`} />
        </Fragment>
      )}
      {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
        <Fragment>
          <div>
            <ViewAddressOn name="CardanoScan" url={`https://cardanoscan.io/address/${address}`} />
          </div>
          <div>
            <ViewAddressOn name="ADAex" url={`https://adaex.org/${address}`} />
          </div>
        </Fragment>
      )}
    </Fragment>
  )

  const addressHash = (
    <Fragment>
      <span className="desktop">
        <span>{address}</span>
        <CopyOnClick value={address} elementClass="copy" stopPropagation>
          <span className="copy-text margin-left" />
        </CopyOnClick>
      </span>
      <span className="mobile">
        <CopyOnClick value={address} preventDefault={false}>
          <span>{address}</span>
        </CopyOnClick>
      </span>
    </Fragment>
  )

  return (
    <div className={`address ${isExpanded ? 'expanded' : ''}`} onClick={expand}>
      <div className="label">
        <div className="value">
          <div className="number no-select">{`/${bip32path.split('/').pop()}`}</div>
          {addressHash}
        </div>
        <div className={`accordion-icon flex-end ${isExpanded ? 'shown' : 'hidden'}`}>
          <DropdownCaret />
        </div>
      </div>
      <div className={`explorer-links ${isExpanded ? 'hide' : 'show'}`}>{explorerLinksInline}</div>
      <div className={`expanded ${isExpanded ? 'show' : 'hide'}`}>
        <div className="qr">
          <img
            src={new QRious({
              value: address,
              level: 'M',
              size: 200,
            }).toDataURL()}
          />
        </div>
        <div className="details">
          {explorerLinks}
          <div>
            Derivation path: <span className="nowrap">{bip32path}</span>
          </div>
          <div className="desktop">
            <CopyOnClick value={address} elementClass="address-link copy">
              <a className="copy-text">Copy Address</a>
            </CopyOnClick>
          </div>
          <div className="verification">
            <AddressVerification address={address} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressItem
