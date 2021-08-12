import {h} from 'preact'
import {useActions, useSelector} from '../../../helpers/connect'
import actions from '../../../actions'
import {useIsActiveAccountDelegating} from '../../../selectors'
import {shouldDisableSendingButton} from '../../../helpers/common'

const DeregisterStakeKeyPage = () => {
  const {deregisterStakingKey} = useActions(actions)
  const {walletOperationStatusType} = useSelector((state) => ({
    walletOperationStatusType: state.walletOperationStatusType,
  }))
  const isDelegating = useIsActiveAccountDelegating()

  if (!isDelegating) return null

  return (
    <div className="deregister-stake-key-card card">
      <h2 className="card-title small-margin">Stake Key Deregistration</h2>
      <p className="deregister-stake-key-card-disclaimer">
        ...if you do not want to use this wallet anymore
      </p>
      <button
        disabled={shouldDisableSendingButton(walletOperationStatusType)}
        className="button secondary cancel-delegation"
        onClick={() => deregisterStakingKey()}
      >
        Deregister stake key
      </button>
    </div>
  )
}

export default DeregisterStakeKeyPage
