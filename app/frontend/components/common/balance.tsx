import {h} from 'preact'
import printAda from '../../helpers/printAda'
import Conversions from './conversions'
import {getActiveAccountInfo} from '../../state'
import {AdaIcon} from './svg'
import actions from '../../actions'
import {useSelector, useActions} from '../../helpers/connect'
import {Lovelace} from '../../types'
import styles from './balance.module.scss'

const Balance = () => {
  const {reloadWalletInfo} = useActions(actions)
  const {conversionRates, balance} = useSelector((state) => ({
    conversionRates: state.conversionRates && state.conversionRates.data,
    balance: getActiveAccountInfo(state).balance as Lovelace,
  }))
  return (
    <div className="balance card">
      <h2 className={`card-title ${styles.balanceTitle}`}>Available balance</h2>
      <div className={styles.balanceRow}>
        <div className="balance-amount" data-cy="SendBalanceAmount">
          {isNaN(Number(balance)) ? balance : `${printAda(balance)}`}
          <AdaIcon />
        </div>
        <button className={'button secondary balance refresh'} onClick={reloadWalletInfo}>
          Refresh
        </button>
      </div>
      {conversionRates && <Conversions balance={balance} conversionRates={conversionRates} />}
      <div className="buy-ada-partner-wrapper">
        <a className="button primary outline buy-ada-partner-link" href="/exchange" target="_blank">
          Buy/Sell ADA
        </a>
        <span className="buy-ada-partner-logo">
          <div>Powered by</div>
          <div>
            <strong>Changelly</strong>
          </div>
        </span>
      </div>
    </div>
  )
}

export default Balance
