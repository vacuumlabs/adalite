import {h} from 'preact'
import styles from './exchange.module.scss'

const Exchange = () => (
  <div className={`${styles.wrapper}`}>
    <div className={`card ${styles.card}`}>
      <div className={styles.iframeWrapper}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src="https://widget.changelly.com?from=*&to=*&amount=1&address=&fromDefault=btc&toDefault=eth&theme=default&merchant_id=pz2lyn57ztluz5po&payment_id=&v=3"
        >
          Can't load widget
        </iframe>
      </div>
    </div>
  </div>
)

export default Exchange
