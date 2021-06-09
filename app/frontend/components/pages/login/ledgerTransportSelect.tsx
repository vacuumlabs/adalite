import {h} from 'preact'
import SearchableSelect from '../../common/searchableSelect'
import {LedgerTransportType} from '../../../types'
import styles from './ledgerTransportSelect.module.scss'

interface Props {
  onSelect: (ledgerTransportType: LedgerTransportType) => void
}

const LedgerTransportSelect = ({onSelect}: Props) => {
  const dropdownAssetItems = [
    LedgerTransportType.DEFAULT,
    LedgerTransportType.U2F,
    LedgerTransportType.WEB_USB,
    LedgerTransportType.WEB_HID,
  ]

  return (
    <SearchableSelect
      wrapperClassName={`no-margin ${styles.wrapper}`}
      defaultItem={LedgerTransportType.DEFAULT}
      displaySelectedItemClassName={`input dropdown ${styles.dropdown}`}
      items={dropdownAssetItems}
      onSelect={onSelect}
      showSearch={false}
    />
  )
}

export default LedgerTransportSelect
