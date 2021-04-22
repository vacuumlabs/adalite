import {h} from 'preact'
import actions from '../../../actions'
import {useActions} from '../../../helpers/connect'
import tooltip from '../../common/tooltip'
import {isVotingRegistrationOpen} from '../../../helpers/common'

const AppDownloadImage = ({url, imageSrc}: {url: string; imageSrc: string}) => (
  <a href={url} target="_blank">
    <img src={imageSrc} className="app-download" />
  </a>
)

const VotingCard = (): h.JSX.Element => {
  const {openVotingDialog} = useActions(actions)
  const isRegistrationClosed = !isVotingRegistrationOpen()

  return (
    <div className="card" data-cy="VotingCard">
      <h2 className="card-title">Voting</h2>
      <p className="advanced-label">Download the Catalyst Voting APP</p>
      <p>
        In order to participate in Catalyst Funds, first you have to download the Catalyst mobile
        application:
      </p>
      <div className="voting-apps">
        <AppDownloadImage
          url="https://apps.apple.com/kg/app/catalyst-voting/id1517473397"
          imageSrc="assets/app_store_download.svg"
        />
        <AppDownloadImage
          url="https://play.google.com/store/apps/details?id=io.iohk.vitvoting"
          imageSrc="assets/google_play_download.svg"
        />
      </div>
      <p>Once you've downloaded the app, you can register for voting.</p>
      <button
        className="button primary voting"
        disabled={isRegistrationClosed}
        onClick={openVotingDialog}
        {...tooltip(
          'Voting is currently closed.\nPlease wait for the next round.',
          isRegistrationClosed
        )}
        data-cy="VotingRegisterBtn"
      >
        Register
      </button>
    </div>
  )
}

export default VotingCard
