import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import testnetActions from '../../../testnet/testnet-actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'

const formatStakePoolInfo = (info) => {
  return <div className={`stake-pool-info ${info.class}`}>{info.message}</div>
}

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

const getStakePoolValidationMessage = (stakePools, stakePool) => {
  const poolIdUsages = stakePools.filter((pool) => pool.id === stakePool.id)
  const isDuplicate = poolIdUsages.length > 1

  if (!stakePool.valid) {
    return {
      class: 'invalid',
      message: stakePool.id === '' ? '' : 'Invalid stakepool ID',
    }
  }
  if (isDuplicate) {
    return {
      class: 'invalid',
      message: 'Duplicate stake pool',
    }
  }
  if (stakePool.percent === 0) {
    return {
      class: 'valid warning',
      message: `${stakePool.name} | Delegate a non-zero amount`,
    }
  }
  return {
    class: 'valid',
    message: 'StakepoolInfo',
  }
}

const DelegatePage = ({
  updateStakePoolId,
  updateStakePoolPercent,
  addStakePool,
  removeStakePool,
  stakePools,
  delegationFee,
  calculatingDelegationFee,
  delegationValidationError,
  changeDelegation,
}) => {
  const delegatedPercent = stakePools.map((pool) => pool.percent).reduce((x, y) => x + y, 0)
  const undelegatedPercent = 100 - delegatedPercent

  return (
    <div className="delegate card">
      <h2 className="card-title">Delegate Stake</h2>
      <div className="stakepools">
        <ul className="stake-pool-list">
          {stakePools.map((pool, i) => (
            <li key={i} className="stake-pool-item">
              <input
                type="text"
                className="input stake-pool-id"
                name={`${i}`}
                placeholder="Stake Pool ID"
                value={pool.id}
                onInput={updateStakePoolId}
                autoComplete="off"
              />
              <div className="input-wrapper-percent">
                <input
                  type="number"
                  min="0"
                  max={pool.percent + undelegatedPercent}
                  {...{accuracy: '1'}}
                  className="input stake-pool-percent"
                  name={`${i}`}
                  value={pool.percent}
                  placeholder={pool.percent}
                  onInput={updateStakePoolPercent}
                  autoComplete="off"
                />
                <div className="percent">%</div>
              </div>
              {formatStakePoolInfo(getStakePoolValidationMessage(stakePools, pool))}
              {stakePools.length <= 1 || i === 0 ? (
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
          className={`delegation-percent${!delegationValidationError ? ' valid' : ''}`}
        >{`${delegatedPercent} %`}</div>
        <label className="fee-label">
          Fee<AdaIcon />
        </label>
        <div className="delegation-fee">{printAda(delegationFee)}</div>
      </div>
      <div className="validation-row">
        <button
          className="button primary staking"
          disabled={delegationValidationError || calculatingDelegationFee}
          onClick={changeDelegation}
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
    stakePools: state.testnetDelegation.selectedPools,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.delegationFee,
    delegationValidationError: state.delegationValidationError,
  }),
  testnetActions
)(DelegatePage)
