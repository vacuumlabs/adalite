import {h} from 'preact'
import {useActions} from '../../../helpers/connect'
import actions from '../../../actions'
import {useIsActiveAccountDelegating} from '../../../selectors'

const DeregisterStakeKeyPage = () => {
  const {deregisterStakingKey} = useActions(actions)
  const isDelegating = useIsActiveAccountDelegating()

  if (!isDelegating) return null

  return (
    <div className="deregister-stake-key-card card">
      <h2 className="card-title small-margin">Stake Key Deregistration</h2>
      <p className="deregister-stake-key-card-disclaimer">
        ...if you do not want to use this wallet anymore
      </p>
      <button className="button secondary cancel-delegation" onClick={() => deregisterStakingKey()}>
        Deregister stake key
      </button>
    </div>
  )
}

export default DeregisterStakeKeyPage
