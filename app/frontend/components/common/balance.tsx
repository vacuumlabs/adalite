import {h} from 'preact'
import printAda from '../../helpers/printAda'
import Conversions from './conversions'
import {Lovelace} from '../../state'
import {AdaIcon} from './svg'
import actions from '../../actions'
import {connect} from '../../libs/unistore/preact'

interface Props {
  balance: Lovelace
  reloadWalletInfo: (state: any) => void
  conversionRates: any
}

const Balance = ({balance, reloadWalletInfo, conversionRates}: Props) => (
  <div className="balance card">
    <h2 className="card-title balance-title">Balance</h2>
    <div className="balance-row">
      <div className="balance-amount">
        {isNaN(Number(balance)) ? balance : `${printAda(balance)}`}
        <AdaIcon />
      </div>
      <button className="button secondary refresh" onClick={reloadWalletInfo}>
        Refresh Balance
      </button>
    </div>
    {conversionRates && <Conversions balance={balance} conversionRates={conversionRates} />}
    {/* <div className="buy-ada-partner-wrapper">
      <a
        className="button primary outline link buy-ada-partner-link"
        href="https://exchange.adalite.io/"
        target="_blank"
      >
        Buy ADA
      </a>
      <span className="buy-ada-partner-logo">
        Powered by<img
          className="buy-ada-partner-logo-img"
          src="assets/coinswitch-logo.svg"
          alt="CoinSwitch logo"
        />
      </span>
    </div> */}
  </div>
)

export default connect(
  (state) => ({
    conversionRates: state.conversionRates && state.conversionRates.data,
    balance: state.balance,
  }),
  actions
)(Balance)
