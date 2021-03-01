import {h} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import {State} from '../../state'
import {useEffect, useLayoutEffect, useRef, useState} from 'preact/hooks'

interface Props<T> {
  wrapperClassName?: string
  label?: string
  defaultItem: T
  items: T[]
  displaySelectedItem: (t: T) => string | h.JSX.Element
  displaySelectedItemClassName?: string
  displayItem: (t: T) => string | h.JSX.Element
  onSelect: (t: T) => void
  showSearch: boolean
  searchPredicate: (query: string, t: T) => boolean
  searchPlaceholder: string
  dropdownClassName?: string
  getDropdownWidth?: () => string
}

// <T extends {}> is workaround for <T> being recognized as JSX element instead of generics
const SearchableSelect = <T extends {}>({
  wrapperClassName,
  label,
  defaultItem, // TODO: do we need this, should default item by in state of the parent component?
  items,
  displaySelectedItem,
  displaySelectedItemClassName,
  displayItem,
  onSelect,
  showSearch,
  searchPredicate,
  searchPlaceholder,
  dropdownClassName,
  getDropdownWidth,
}: Props<T>) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const dropdownEl = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [dropdownWidth, setDropdownWidth] = useState(getDropdownWidth())
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

  useLayoutEffect(() => {
    if (getDropdownWidth) {
      const handleResize = () => setDropdownWidth(getDropdownWidth())
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
    return () => null
  }, [getDropdownWidth])

  const optionalClassName = (className?: string) => (className != null ? className : '')

  return (
    <div
      className={`searchable-select-wrapper ${optionalClassName(wrapperClassName)}`}
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
        {displaySelectedItem(defaultItem)}
      </div>
      <div
        ref={dropdownEl}
        className={`searchable-select-dropdown ${visible ? '' : 'hide'} ${optionalClassName(
          dropdownClassName
        )}`}
        style={getDropdownWidth ? `width: ${dropdownWidth}` : ''}
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
                onMouseDown={() => {
                  setVisible(false)
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
