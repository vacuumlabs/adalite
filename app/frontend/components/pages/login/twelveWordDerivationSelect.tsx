import {h} from 'preact'
import SearchableSelect from '../../common/searchableSelect'
import {TwelveWordDerivationMode} from '../../../types'
import styles from './twelveWordDerivationSelect.module.scss'

const DERIVATION_LABELS: Record<TwelveWordDerivationMode, string> = {
  legacy: 'Legacy',
  icarus: 'Icarus',
  exodus: 'Exodus',
}

const DERIVATION_ITEMS: TwelveWordDerivationMode[] = ['legacy', 'icarus', 'exodus']

interface Props {
  selectedItem: TwelveWordDerivationMode
  onSelect: (mode: TwelveWordDerivationMode) => void
}

const TwelveWordDerivationSelect = ({selectedItem, onSelect}: Props) => (
  <SearchableSelect
    wrapperClassName={`no-margin ${styles.wrapper}`}
    selectedItem={selectedItem}
    displaySelectedItemClassName={`input dropdown ${styles.dropdown}`}
    items={DERIVATION_ITEMS}
    displaySelectedItem={(item) => <div>{item ? DERIVATION_LABELS[item] : ''}</div>}
    displayItem={(item) => <div>{DERIVATION_LABELS[item]}</div>}
    onSelect={onSelect}
    showSearch={false}
    disabled={false}
  />
)

export default TwelveWordDerivationSelect
