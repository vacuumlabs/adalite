import {h} from 'preact'
import SearchableSelect from '../../common/searchableSelect'
import {LedgerTransportType} from '../../../types'
import styles from './ledgerTransportSelect.module.scss'

interface Props {
  selectedItem: LedgerTransportType
  onSelect: (ledgerTransportType: LedgerTransportType) => void
}

const LedgerTransportSelect = ({selectedItem, onSelect}: Props) => {
  const dropdownAssetItems = [
    LedgerTransportType.DEFAULT,
    LedgerTransportType.U2F,
    LedgerTransportType.WEB_USB,
    LedgerTransportType.WEB_HID,
  ]

  return (
    <SearchableSelect
      wrapperClassName={`no-margin ${styles.wrapper}`}
      selectedItem={selectedItem}
      displaySelectedItemClassName={`input dropdown ${styles.dropdown}`}
      items={dropdownAssetItems}
      onSelect={onSelect}
      showSearch={false}
      disabled={false}
    />
  )
}

export default LedgerTransportSelect
