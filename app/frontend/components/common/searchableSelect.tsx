import {h} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import {State} from '../../state'
import {useEffect, useRef, useState} from 'preact/hooks'

interface Props<T> {
  wrapperClassName?: string
  label?: string
  defaultItem: T
  items: T[]
  displaySelectedItem: (t: T) => string
  displaySelectedItemClassName?: string
  displayItem: (t: T) => any
  onSelect: (t: T) => void
  showSearch: boolean
  searchPredicate: (query: string, t: T) => boolean
  searchPlaceholder: string
  dropdownClassName?: string
  dropdownStyle?: string
}

// <T extends {}> is workaround for <T> being recognized as JSX element instead of generics
const SearchableSelect = <T extends {}>({
  wrapperClassName,
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
  dropdownClassName,
  dropdownStyle,
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

  const optionalClassName = (className?: string) => (className != null ? className : '')

  return (
    <div
      className={`searchable-select-wrapper no-outline ${optionalClassName(wrapperClassName)}`}
      tabIndex={0}
      onBlur={() => !showSearch && showDropdown(false)}
    >
      {label && <div className="searchable-select-label">{label}</div>}
      <div
        className={`searchable-select ${visible ? 'focus ' : ''}${optionalClassName(
          displaySelectedItemClassName
        )}`}
        onClick={() => showDropdown(!visible)}
      >
        {displaySelectedItem(value)}
      </div>
      <div
        ref={dropdownEl}
        className={`searchable-select-dropdown ${visible ? '' : 'hide'} ${optionalClassName(
          dropdownClassName
        )}`}
        style={dropdownStyle}
      >
        {showSearch && (
          <input
            ref={inputEl}
            type="text"
            className="searchable-select-input"
            value={search}
            onInput={(event: any) => setSearch(event.target.value)}
            onBlur={() => showDropdown(false)}
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
