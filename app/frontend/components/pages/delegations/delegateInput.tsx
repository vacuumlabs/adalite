import {Stakepool, PoolRecommendation} from '../../../types'
import {Fragment, h} from 'preact'
import {useEffect, useState} from 'preact/hooks'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import {getSourceAccountInfo, State} from '../../../state'
import {StakepoolDataProvider} from '../../../../frontend/helpers/dataProviders/types'

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

// TODO: move to types
type Error = {
  code: string
  params?: {hasTickerMapping: boolean}
}

type ValidatedInput = {
  poolHash: string | null
  error: Error
}

const validateInput = (
  fieldValue: string,
  validStakepoolDataProvider: StakepoolDataProvider
): ValidatedInput => {
  const pool =
    validStakepoolDataProvider.getPoolInfoByPoolHash(fieldValue) ||
    validStakepoolDataProvider.getPoolInfoByTicker(fieldValue)
  if (pool) return {poolHash: pool.poolHash, error: null}

  const hasTickerMapping = validStakepoolDataProvider.hasTickerMapping
  const isTickerString = fieldValue.length <= 5 && fieldValue.toUpperCase() === fieldValue
  const poolHash = null
  if (!hasTickerMapping && isTickerString) return {poolHash, error: {code: 'TickerSearchDisabled'}}
  return {poolHash, error: {code: 'InvalidStakepoolIdentifier', params: {hasTickerMapping}}}
}

interface Props {
  poolRecommendation: PoolRecommendation
  pool: Stakepool
  validStakepoolDataProvider: StakepoolDataProvider
  updateStakePoolIdentifier: (poolHash: string, validationError?: any) => void
  resetStakePoolIndentifier: () => void
}

const DelegateInput = ({
  poolRecommendation,
  pool,
  validStakepoolDataProvider,
  updateStakePoolIdentifier,
  resetStakePoolIndentifier,
}: Props): h.JSX.Element => {
  const [fieldValue, setFieldValue] = useState('')
  const [isTicker, setIsTicker] = useState(false)
  const [isPoolHash, setIsPoolHash] = useState(!!fieldValue)

  useEffect(() => {
    const recommendedPoolHash = poolRecommendation?.recommendedPoolHash || pool?.poolHash
    if (recommendedPoolHash) {
      const {poolHash, error} = validateInput(recommendedPoolHash, validStakepoolDataProvider)
      updateStakePoolIdentifier(poolHash, error)
      setFieldValue(recommendedPoolHash)
    }
  }, [pool, poolRecommendation, validStakepoolDataProvider, updateStakePoolIdentifier])

  const handleOnInput = (event: any): void => {
    const fieldValue: string = event?.target?.value
    const isTicker = fieldValue && !!validStakepoolDataProvider.getPoolInfoByTicker(fieldValue)
    const isPoolHash = fieldValue && !!validStakepoolDataProvider.getPoolInfoByPoolHash(fieldValue)
    setFieldValue(fieldValue)
    setIsTicker(isTicker)
    setIsPoolHash(isPoolHash)

    if (fieldValue) {
      const {poolHash, error} = validateInput(fieldValue, validStakepoolDataProvider)
      updateStakePoolIdentifier(poolHash, error)
    } else {
      resetStakePoolIndentifier()
    }
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
