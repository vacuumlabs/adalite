import {h} from 'preact'
import {useSelector} from '../../../helpers/connect'
import {useState, useCallback} from 'preact/hooks'

import range from '../../../wallet/helpers/range'
import {formatAccountIndex} from '../../../helpers/formatAccountIndex'

const AccountDropdown = ({setAccountFunc, accountIndex}) => {
  const [shouldHideAccountDropdown, hideAccountDropdown] = useState(true)

  const accountsInfo = useSelector((state) => state.accountsInfo)

  const toggleAccountDropdown = useCallback(() => {
    hideAccountDropdown(!shouldHideAccountDropdown)
  }, [shouldHideAccountDropdown])

  return (
    <div className="account-dropdown">
      <button
        className="account-dropdown-button"
        onBlur={() => hideAccountDropdown(true)}
        onClick={() => toggleAccountDropdown()}
        data-cy="AccountDropdownButton"
      >
        {`Account ${formatAccountIndex(accountIndex)}`}
      </button>
      <div className={`account-dropdown-content ${shouldHideAccountDropdown ? 'hide' : 'show'}`}>
        {range(0, accountsInfo.length).map((i) => (
          <a
            key={i}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setAccountFunc(i)
              hideAccountDropdown(true)
            }}
            data-cy="AccountDropdownItem"
          >
            {`Account ${formatAccountIndex(i)}`}
          </a>
        ))}
      </div>
    </div>
  )
}

export default AccountDropdown
