import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {useState, useCallback} from 'preact/hooks'

import range from '../../../wallet/helpers/range'
import {State} from '../../../state'

const AccountDropdown = ({
  accountIndex,
  setAccountFunc,
  accountsInfo,
  shouldNumberAccountsFromOne,
}) => {
  const [shouldHideAccountDropdown, hideAccountDropdown] = useState(true)
  const toggleAccountDropdown = useCallback(
    () => {
      hideAccountDropdown(!shouldHideAccountDropdown)
    },
    [shouldHideAccountDropdown]
  )

  return (
    <div className="account-dropdown">
      <button
        className="account-dropdown-button"
        onBlur={() => hideAccountDropdown(true)}
        onClick={() => toggleAccountDropdown()}
      >
        {shouldNumberAccountsFromOne ? `Account #${accountIndex + 1}` : `Account ${accountIndex}`}
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
          >
            {shouldNumberAccountsFromOne ? `Account #${i + 1}` : `Account ${i}`}
          </a>
        ))}
      </div>
    </div>
  )
}

export default connect(
  (state: State) => ({
    accountsInfo: state.accountsInfo,
    activeAccountIndex: state.activeAccountIndex,
    shouldNumberAccountsFromOne: state.shouldNumberAccountsFromOne,
  }),
  actions
)(AccountDropdown)
