import {h} from 'preact'
import actions from '../../../actions'
import {useActions, useSelector} from '../../../helpers/connect'
import tooltip from '../../common/tooltip'
import {getVotingRegistrationStatus, shouldDisableSendingButton} from '../../../helpers/common'
import {hasStakingKey, useActiveAccount, useHasEnoughFundsForCatalyst} from '../../../selectors'
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
  const {walletOperationStatusType} = useSelector((state) => ({
    walletOperationStatusType: state.walletOperationStatusType,
  }))
  const hasEnoughFundsForCatalyst = useHasEnoughFundsForCatalyst()
  const activeAccount = useActiveAccount()
  const hasRegisteredStakingKey = hasStakingKey(activeAccount)

  const getUnmetPreconditionMessage = (): string | null => {
    const votingRegistrationStatus = getVotingRegistrationStatus()
    if (votingRegistrationStatus.isOpen === false) {
      return votingRegistrationStatus.explanation
    }
    if (!hasEnoughFundsForCatalyst) {
      return `Only users with more than ${toAda(
        CATALYST_MIN_THRESHOLD as Lovelace
      )} ADA\ncan participate in voting.`
    }
    if (!hasRegisteredStakingKey) {
      return 'You should delegate to a stake pool\nin order to participate in Catalyst voting.'
    }
    return null
  }

  const unmetPreconditionMessage = getUnmetPreconditionMessage()
  const isRegistrationDisabled = unmetPreconditionMessage !== null

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
          {...tooltip(
            'Cannot register for voting transaction is pending or reloading',
            shouldDisableSendingButton(walletOperationStatusType)
          )}
          className="button primary"
          disabled={isRegistrationDisabled || shouldDisableSendingButton(walletOperationStatusType)}
          onClick={openVotingDialog}
          {...tooltip(unmetPreconditionMessage, isRegistrationDisabled)}
          data-cy="VotingRegisterBtn"
        >
          Register
        </button>
        {isRegistrationDisabled && <div className={styles.error}>{unmetPreconditionMessage}</div>}
      </div>
    </div>
  )
}

export default VotingCard
