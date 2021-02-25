import {h} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import {State} from '../../state'
import {useEffect, useRef, useState} from 'preact/hooks'

interface Props<T> {
  label: string
  defaultItem: T
  items: T[]
  displaySelectedItem: (t: T) => string
  displaySelectedItemClassName: string
  displayItem: (t: T) => any
  onSelect: (t: T) => void
  showSearch: boolean
  searchPredicate: (query: string, t: T) => boolean
  searchPlaceholder: string
}

// <T extends {}> is workaround for <T> being recognized as JSX element instead of generics
const SearchableSelect = <T extends {}>({
  label,
  defaultItem,
  items,
  displaySelectedItem,
  displaySelectedItemClassName,
  displayItem,
  onSelect,
  showSearch,
  searchPredicate,
  searchPlaceholder,
}: Props<T>) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const dropdownEl = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState(defaultItem)
  const [search, setSearch] = useState('')
  const shouldShowItem = (item: T) => searchPredicate(search, item)
  const showDropdown = (bool: boolean) => {
    setVisible(bool)
    setSearch('')
    if (bool && inputEl?.current) {
      inputEl.current.focus()
    }
  }

  useEffect(() => {
    dropdownEl.current.scrollTop = 0
  })

  return (
    <div className="searchable-select-wrapper" tabIndex={0} onBlur={() => showDropdown(false)}>
      <div className="searchable-select-label">{label}</div>
      <div
        className={`searchable-select ${displaySelectedItemClassName}`}
        onClick={() => showDropdown(!visible)}
      >
        {displaySelectedItem(value)}
      </div>
      <div ref={dropdownEl} className={`searchable-select-dropdown ${visible ? '' : 'hide'}`}>
        {showSearch && (
          <input
            ref={inputEl}
            type="text"
            className="searchable-select-input"
            value={search}
            onInput={(event: any) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
          />
        )}
        <div>
          {items &&
            items.map((item, i) => (
              <div
                className={`searchable-select-item ${shouldShowItem(item) ? '' : 'hide'}`}
                key={i}
                onClick={() => {
                  setVisible(false)
                  setValue(item)
                  onSelect(item)
                }}
              >
                {displayItem(item)}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default connect((state: State) => ({}), actions)(SearchableSelect)
