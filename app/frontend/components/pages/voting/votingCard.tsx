import {h} from 'preact'
import actions from '../../../actions'
import {useActions, useSelector} from '../../../helpers/connect'
import tooltip from '../../common/tooltip'
import {isVotingRegistrationOpen} from '../../../helpers/common'
import {
  hasStakingKey,
  useActiveAccount,
  useHasEnoughFundsForCatalyst,
  usingHwWalletSelector,
} from '../../../selectors'
import {CATALYST_MIN_THRESHOLD} from '../../../wallet/constants'
import {Lovelace} from '../../../types'
import {toAda} from '../../../helpers/adaConverters'
import styles from './voting.module.scss'
import * as QRious from '../../../libs/qrious'

const AppDownloadInfo = ({url, imageSrc}: {url: string; imageSrc: string}) => (
  <div className={styles.catalystAppPair}>
    <a href={url} target="_blank">
      <img src={imageSrc} className={styles.appDownload} />
    </a>
    <img
      src={new QRious({
        value: url,
        level: 'L',
        size: 120,
        padding: null,
      }).toDataURL()}
    />
  </div>
)

const VotingCard = (): h.JSX.Element => {
  const {openVotingDialog} = useActions(actions)
  const {usingHwWallet} = useSelector((state) => ({
    usingHwWallet: usingHwWalletSelector(state),
  }))
  const hasEnoughFundsForCatalyst = useHasEnoughFundsForCatalyst()
  const activeAccount = useActiveAccount()
  const hasRegisteredStakingKey = hasStakingKey(activeAccount)

  const getValidationMessage = (): string => {
    if (!isVotingRegistrationOpen()) {
      return 'Voting is currently closed.\nPlease wait for the next round.'
    }
    if (usingHwWallet) {
      return 'Only mnemonic wallets can participate in Catalyst Fund4 Voting.'
    }
    if (!hasEnoughFundsForCatalyst) {
      return `Only users with more than ${toAda(
        CATALYST_MIN_THRESHOLD as Lovelace
      )} ADA\ncan participate in voting.`
    }
    if (!hasRegisteredStakingKey) {
      return 'You should delegate to a stake pool\nin order to participate in Catalyst voting.'
    }
    return ''
  }

  const validationMessage = getValidationMessage()
  const isRegistrationDisabled = validationMessage !== ''

  return (
    <div className="card" data-cy="VotingCard">
      <h2 className="card-title">Voting</h2>
      <p className="advanced-label">Download the Catalyst Voting APP</p>
      <p>
        In order to participate in Catalyst Funds, first you have to download the Catalyst mobile
        application:
      </p>
      <div className={styles.votingApps}>
        <AppDownloadInfo
          url="https://apps.apple.com/in/app/catalyst-voting/id1517473397"
          imageSrc="assets/app_store_download.svg"
        />
        <AppDownloadInfo
          url="https://play.google.com/store/apps/details?id=io.iohk.vitvoting"
          imageSrc="assets/google_play_download.svg"
        />
      </div>
      <p>Once you've downloaded the app, you can register for voting.</p>
      <div className={styles.validationRow}>
        <button
          className="button primary"
          disabled={isRegistrationDisabled}
          onClick={openVotingDialog}
          {...tooltip(validationMessage, isRegistrationDisabled)}
          data-cy="VotingRegisterBtn"
        >
          Register
        </button>
        {isRegistrationDisabled && <div className={styles.error}>{validationMessage}</div>}
      </div>
    </div>
  )
}

export default VotingCard
