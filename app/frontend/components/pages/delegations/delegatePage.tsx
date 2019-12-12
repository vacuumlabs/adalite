import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'

const formatStakePoolInfo = () => {
  return <div className={`stake-pool-info vaid`}>Valid</div>
}

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

// const getStakePoolValidationMessage = (stakePool, stakePools) => {
//   const validationInfo = {}

//   const poolIdUsages = stakePools.filter((pool) => pool.id === stakePool.id)
//   const isDuplicate = poolIdUsages.length > 1

//   if (stakePool.valid) {
//     if (isDuplicate) {
//       validationInfo.class = 'invalid'
//       validationInfo.message = 'Duplicate stake pool'
//     } else if (stakePool.percent === 0) {
//       validationInfo.class = 'valid warning'
//       validationInfo.message = `${stakePool.name} | Delegate a non-zero amount`
//     } else {
//       validationInfo.class = 'valid'
//       validationInfo.message = `${stakePool.name}`
//     }
//   } else {
//     validationInfo.class = 'invalid'
//     validationInfo.message = stakePool.id === '' ? '' : 'Invalid ID'
//   }
//   return validationInfo
// }

const DelegatePage = ({
  updateStakePoolId,
  updateStakePoolPercent,
  addStakePool,
  removeStakePool,
  stakePools,
  delegationFee,
  calculatingDelegationFee,
  isDelegationValid,
}) => {
  const delegatedPercent = stakePools.map((pool) => pool.percent).reduce((x, y) => x + y, 0)
  const undelegatedPercent = 100 - delegatedPercent

  return (
    <div className="delegate card">
      <h2 className="card-title">Delegate Stake</h2>
      <div className="stakepools">
        <ul className="stake-pool-list">
          {stakePools.map((pool, i) => (
            <li className="stake-pool-item">
              <input
                type="text"
                className="input stake-pool-id"
                name={`${i}`}
                placeholder="Stake Pool ID"
                value={pool.id}
                onInput={updateStakePoolId}
                autocomplete="off"
              />
              <div className="input-wrapper-percent">
                <input
                  type="number"
                  min="0"
                  max={pool.percent + undelegatedPercent}
                  {...{accuracy:"1"}}
                  className="input stake-pool-percent"
                  name={`${i}`}
                  value={pool.percent}
                  placeholder={pool.percent}
                  onInput={updateStakePoolPercent}
                  autocomplete="off"
                />
                <div className="percent">%</div>
              </div>
              {formatStakePoolInfo()}
              {stakePools.length <= 1 ? (
                <div />
              ) : (
                <button className="button stake-pool" name={`${i}`} onClick={removeStakePool}>
                  remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="add-stake-pool-wrapper">
        <button
          className="button add-stake-pool"
          id="add-stake-pool"
          onClick={addStakePool}
          disabled={false}
        >
          Add Another Stake Pool
        </button>
      </div>
      <div className="delegation-info-row">
        <label className="fee-label">Delegated</label>
        <div
          className={`delegation-percent${isDelegationValid ? ' valid' : ''}`}
        >{`${delegatedPercent} %`}</div>
        <label className="fee-label">
          Fee<AdaIcon />
        </label>
        <div className="delegation-fee">{printAda(delegationFee)}</div>
      </div>
      <div className="validation-row">
        <button
          className="button primary staking"
          disabled={!isDelegationValid || calculatingDelegationFee}
          onClick={null}
          {...tooltip('100% of funds must be delegated to valid stake pools', false)}
        >
          Delegate
        </button>
        {// : h(SendValidation, {
        //   sendFormValidationError,
        //   sendResponse,
        // })
        calculatingDelegationFee ? <CalculatingFee /> : <div />}
      </div>
    </div>
  )
}

export default connect(
  (state) => ({
    stakePools: state.stakePools,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.delegationFee,
    isDelegationValid: state.isDelegationValid,
  }),
  actions
)(DelegatePage)
