import {h} from 'preact'
import SearchableSelect from '../../common/searchableSelect'
import {LedgerTransportType} from '../../../../frontend/types'
import styles from './ledgerTransportationSelect.module.scss'

interface Props {
  onSelect: (ledgerTransportType: LedgerTransportType) => void
}

const LedgerTransportationSelect = ({onSelect}: Props) => {
  const dropdownAssetItems = [
    LedgerTransportType.DEFAULT,
    LedgerTransportType.U2F,
    LedgerTransportType.WEB_USB,
    LedgerTransportType.WEB_HID,
  ]

  const displayItem = (item: LedgerTransportType) => <div>{item}</div>

  return (
    <SearchableSelect
      label="Transport"
      labelClassName={styles.label}
      wrapperClassName="no-margin"
      defaultItem={LedgerTransportType.DEFAULT}
      displaySelectedItem={displayItem}
      displaySelectedItemClassName={`input dropdown ${styles.dropdown}`}
      items={dropdownAssetItems}
      displayItem={displayItem}
      onSelect={onSelect}
      showSearch={false}
    />
  )
}

export default LedgerTransportationSelect
