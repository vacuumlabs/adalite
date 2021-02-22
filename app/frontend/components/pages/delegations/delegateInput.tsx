import {Stakepool, PoolRecommendation, StakepoolDataProvider} from '../../../types'
import {Fragment, h} from 'preact'
import {useEffect, useState} from 'preact/hooks'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {getSourceAccountInfo, State} from '../../../state'

type StakePoolLabelProps = {
  isTicker: boolean
  isPoolHash: boolean
  tickerSearchEnabled: boolean
}

const StakePoolLabel = ({
  isTicker,
  isPoolHash,
  tickerSearchEnabled,
}: StakePoolLabelProps): h.JSX.Element => (
  <Fragment>
    {tickerSearchEnabled && (
      <Fragment>
        <span className={isTicker ? 'highlight' : ''}>Ticker</span>
        {' or '}
      </Fragment>
    )}
    <span className={isPoolHash ? 'highlight' : ''}>Stake Pool ID</span>
  </Fragment>
)

interface Props {
  poolRecommendation: PoolRecommendation
  pool: Stakepool
  validStakepoolDataProvider: StakepoolDataProvider
  updateStakePoolIdentifier: (poolHash: string, validationError?: any) => void
}

const DelegateInput = ({
  poolRecommendation,
  pool,
  validStakepoolDataProvider,
  updateStakePoolIdentifier,
}: Props): h.JSX.Element => {
  useEffect(() => {
    const poolHash = poolRecommendation?.recommendedPoolHash || pool?.poolHash
    if (poolHash) {
      updateStakePoolIdentifier(poolHash)
    }
  }, [pool, poolRecommendation, updateStakePoolIdentifier])

  const [fieldValue, setFieldValue] = useState(
    poolRecommendation?.recommendedPoolHash || pool?.poolHash || ''
  )
  const [isTicker, setIsTicker] = useState(false)
  const [isPoolHash, setIsPoolHash] = useState(!!fieldValue)

  const handleOnInput = (event: any): void => {
    const fieldValue: string = event?.target?.value
    const isTicker = fieldValue && !!validStakepoolDataProvider.getPoolInfoByTicker(fieldValue)
    const isPoolHash = fieldValue && !!validStakepoolDataProvider.getPoolInfoByPoolHash(fieldValue)
    setFieldValue(fieldValue)
    setIsTicker(isTicker)
    setIsPoolHash(isPoolHash)
    const poolHash = isTicker
      ? validStakepoolDataProvider.getPoolInfoByTicker(fieldValue).poolHash
      : fieldValue
    const hasTickerMapping = validStakepoolDataProvider.hasTickerMapping
    const error =
      poolHash === '' || validStakepoolDataProvider.getPoolInfoByPoolHash(poolHash)
        ? null
        : {code: 'InvalidStakepoolIdentifier', params: {hasTickerMapping}}
    updateStakePoolIdentifier(poolHash, error)
  }

  return (
    <Fragment>
      <div
        className={`stake-pool-input-label ${
          validStakepoolDataProvider.hasTickerMapping ? '' : 'stake-pool-id-only'
        }`}
      >
        <StakePoolLabel
          isTicker={isTicker}
          isPoolHash={isPoolHash}
          tickerSearchEnabled={validStakepoolDataProvider.hasTickerMapping}
        />
      </div>
      <input
        type="text"
        className="input stake-pool-id"
        name={'pool'}
        value={fieldValue}
        onInput={handleOnInput}
        autoComplete="off"
      />
    </Fragment>
  )
}

export default connect(
  (state: State) => ({
    poolRecommendation: getSourceAccountInfo(state).poolRecommendation,
    pool: getSourceAccountInfo(state).shelleyAccountInfo.delegation,
    validStakepoolDataProvider: state.validStakepoolDataProvider,
  }),
  actions
)(DelegateInput)
