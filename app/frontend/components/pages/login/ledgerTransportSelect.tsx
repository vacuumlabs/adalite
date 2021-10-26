import {h} from 'preact'
import SearchableSelect from '../../common/searchableSelect'
import {LedgerTransportChoice} from '../../../types'
import styles from './ledgerTransportSelect.module.scss'

interface Props {
  selectedItem: LedgerTransportChoice
  onSelect: (ledgerTransportType: LedgerTransportChoice) => void
}

const LedgerTransportSelect = ({selectedItem, onSelect}: Props) => {
  const dropdownAssetItems = [
    LedgerTransportChoice.DEFAULT,
    LedgerTransportChoice.U2F,
    LedgerTransportChoice.WEB_USB,
    LedgerTransportChoice.WEB_HID,
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
