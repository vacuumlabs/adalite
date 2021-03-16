import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {useState, useCallback} from 'preact/hooks'

import range from '../../../wallet/helpers/range'
import {State} from '../../../state'
import {printAccountIndex} from '../../../helpers/printAccountIndex'

const AccountDropdown = ({accountIndex, setAccountFunc, accountsInfo}) => {
  const [shouldHideAccountDropdown, hideAccountDropdown] = useState(true)
  const toggleAccountDropdown = useCallback(() => {
    hideAccountDropdown(!shouldHideAccountDropdown)
  }, [shouldHideAccountDropdown])

  return (
    <div className="account-dropdown">
      <button
        className="account-dropdown-button"
        onBlur={() => hideAccountDropdown(true)}
        onClick={() => toggleAccountDropdown()}
      >
        {`Account ${printAccountIndex(accountIndex)}`}
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
            {`Account ${printAccountIndex(i)}`}
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
  }),
  actions
)(AccountDropdown)
