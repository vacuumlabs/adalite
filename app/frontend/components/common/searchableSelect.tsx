import {h} from 'preact'
import {useEffect, useLayoutEffect, useRef, useState} from 'preact/hooks'
import onSubTreeBlur from '../../../frontend/helpers/onSubTreeBlur'

interface Props<T> {
  wrapperClassName?: string
  label?: string | h.JSX.Element
  labelClassName?: string
  defaultItem: T
  items: T[]
  displaySelectedItem?: (t: T) => string | h.JSX.Element
  displaySelectedItemClassName?: string
  displayItem?: (t: T) => string | h.JSX.Element
  onSelect: (t: T) => void
  showSearch: boolean
  searchPredicate?: (query: string, t: T) => boolean
  searchPlaceholder?: string
  dropdownClassName?: string
  getDropdownWidth?: () => string
}

// <T extends {}> is workaround for <T> being recognized as JSX element instead of generics
const SearchableSelect = <T extends {}>({
  wrapperClassName,
  label,
  labelClassName,
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
  getDropdownWidth,
}: Props<T>) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const dropdownEl = useRef<HTMLDivElement>(null)
  const wrapperEl = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [dropdownWidth, setDropdownWidth] = useState(getDropdownWidth ? getDropdownWidth() : '')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(defaultItem)
  const shouldShowItem = (item: T) => (searchPredicate ? searchPredicate(search, item) : true)
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
      ref={wrapperEl}
      data-cy="SendAssetDropdown"
      // TODO: remove @ts-ignore when onFocusOut is added to jsx.d.ts
      // @ts-ignore
      onfocusout={(e) => onSubTreeBlur(e, wrapperEl, () => showDropdown(false))}
    >
      {label && (
        <div className={`searchable-select-label ${optionalClassName(labelClassName)}`}>
          {label}
        </div>
      )}
      <div
        className={`searchable-select ${visible ? 'focus ' : ''}${optionalClassName(
          displaySelectedItemClassName
        )}`}
        onClick={() => showDropdown(!visible)}
      >
        {displaySelectedItem ? displaySelectedItem(selectedItem) : <div>{selectedItem}</div>}
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
            placeholder={searchPlaceholder != null ? searchPlaceholder : ''}
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
                  onSelect(item)
                  setSelectedItem(item)
                }}
              >
                {displayItem ? displayItem(item) : <div>{item}</div>}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default SearchableSelect
