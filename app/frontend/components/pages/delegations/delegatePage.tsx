import {h, Fragment} from 'preact'
import {useState, useEffect, useRef, useCallback} from 'preact/hooks'
import {useActions, useSelector} from '../../../helpers/connect'
import actions from '../../../actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import {getErrorMessage} from '../../../errors'
import {getSourceAccountInfo} from '../../../state'
import Accordion from '../../common/accordion'
import {isBigDelegatorSelector} from '../../../selectors'
import {StakePoolInfo} from './stakePoolInfo'
import DelegateInput from './delegateInput'
import {ADALITE_CONFIG} from '../../../../frontend/config'
import {StakepoolDataProvider} from '../../../../frontend/helpers/dataProviders/types'

const CalculatingFee = (): h.JSX.Element => (
  <div className="validation-message send">Calculating fee...</div>
)

type DelegationValidationProps = {
  delegationValidationError: any
  txSuccessTab: string
}

// REFACTOR: "txSuccessTab", what about using "success notification" instead?
const DelegationValidation = ({
  delegationValidationError,
  txSuccessTab,
}: DelegationValidationProps): h.JSX.Element =>
  txSuccessTab === 'stake' && !delegationValidationError ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    delegationValidationError && (
      <div className="validation-message error">
        {getErrorMessage(delegationValidationError.code)}
      </div>
    )
  )

const BigDelegatorOffer = (): h.JSX.Element => (
  <div className="banner delegation-offer delegation-offer-text">
    Due to factors such as pool saturation, maximizing staking rewards is no easy task for high
    balance wallets like yours. Get our premium assistance via{' '}
    <a href="https://t.me/pepo6969" target="_blank" rel="noopener">
      Telegram
    </a>{' '}
    or at <a href={'mailto:michal.petro@vacuumlabs.com'}>michal.petro@vacuumlabs.com</a>.
  </div>
)

// REFACTOR: (Untyped errors): move to types
// is "hasTickerMapping" something specific or general?
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
  if (ADALITE_CONFIG.ADALITE_ENABLE_SEARCH_BY_TICKER) {
    const pool =
      validStakepoolDataProvider.getPoolInfoByPoolHash(fieldValue) ||
      validStakepoolDataProvider.getPoolInfoByTicker(fieldValue)
    if (pool) return {poolHash: pool.poolHash, error: null}

    const hasTickerMapping = validStakepoolDataProvider.hasTickerMapping
    const isTickerString = fieldValue.length <= 5 && fieldValue.toUpperCase() === fieldValue
    const poolHash = null
    if (!hasTickerMapping && isTickerString) {
      return {poolHash, error: {code: 'TickerSearchDisabled'}}
    }
    return {poolHash, error: {code: 'InvalidStakepoolIdentifier', params: {hasTickerMapping}}}
  }

  const pool = validStakepoolDataProvider.getPoolInfoByPoolHash(fieldValue)
  if (pool) return {poolHash: pool.poolHash, error: null}
  return {
    poolHash: null,
    error: {code: 'InvalidStakepoolIdentifier', params: {hasTickerMapping: false}},
  }
}

// TODO: we may create general util from this
const useHandleOnStopTyping = () => {
  const debouncedHandleInputValidation = useRef(0)

  useEffect(() => {
    debouncedHandleInputValidation.current && clearTimeout(debouncedHandleInputValidation.current)
  }, [])

  return (fn: Function, timeout = 200) => {
    clearTimeout(debouncedHandleInputValidation.current)
    debouncedHandleInputValidation.current = window.setTimeout(fn, timeout)
  }
}

interface Props {
  withAccordion: boolean
  title: string
}

const Delegate = ({withAccordion, title}: Props): h.JSX.Element => {
  const {
    txSuccessTab,
    stakePool,
    currentDelegation,
    calculatingDelegationFee,
    delegationFee,
    delegationValidationError,
    gettingPoolInfo,
    isBigDelegator,
    isShelleyCompatible,
    poolRecommendation,
    validStakepoolDataProvider,
  } = useSelector((state) => ({
    // REFACTOR: (Untyped errors)
    delegationValidationError: state.delegationValidationError,
    stakePool: state.shelleyDelegation.selectedPool,
    currentDelegation: getSourceAccountInfo(state).shelleyAccountInfo.delegation,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.shelleyDelegation.delegationFee,
    txSuccessTab: state.txSuccessTab,
    gettingPoolInfo: state.gettingPoolInfo,
    isShelleyCompatible: state.isShelleyCompatible,
    poolRecommendation: getSourceAccountInfo(state).poolRecommendation,
    isBigDelegator: isBigDelegatorSelector(state),
    validStakepoolDataProvider: state.validStakepoolDataProvider,
  }))
  const {confirmTransaction, updateStakePoolIdentifier, resetStakePoolIndentifier} = useActions(
    actions
  )
  const handleOnStopTyping = useHandleOnStopTyping()

  const [fieldValue, setFieldValue] = useState('')
  const [error, setError] = useState<Error>(null)

  const handleInputValidation = useCallback(
    (value: string) => {
      if (!value) {
        resetStakePoolIndentifier()
        setError(null)
      } else {
        const {poolHash, error} = validateInput(value, validStakepoolDataProvider)
        if (!error) {
          updateStakePoolIdentifier(poolHash)
        } else {
          resetStakePoolIndentifier()
        }
        setError(error)
      }
      /*
      Relates to REFACTOR (calculateFee):
      This component should store all `txPlan` and `error` states & render confirmation modal
      when user clicks on "Delegate". This could greatly simplify global state flow. For now
      using hybrid solution involving `updateStakePoolIdentifier` (should be later removed)
      */
    },
    [validStakepoolDataProvider, updateStakePoolIdentifier, resetStakePoolIndentifier]
  )

  const handleOnInput = (event: any): void => {
    const newValue: string = event?.target?.value
    setFieldValue(newValue)
    handleOnStopTyping(() => handleInputValidation(newValue), 100)
  }

  // init "stake pool input" and refresh it when "currentDelegation" changes
  useEffect(() => {
    const recommendedPoolHash =
      poolRecommendation?.recommendedPoolHash || currentDelegation?.poolHash

    if (recommendedPoolHash) {
      setFieldValue(recommendedPoolHash)
      handleInputValidation(recommendedPoolHash)
    }
  }, [currentDelegation, handleInputValidation, poolRecommendation])

  const delegationHandler = async (): Promise<void> => {
    await confirmTransaction('delegate')
  }

  const validationError = !!delegationValidationError || !!error || !stakePool

  const delegationHeader = <h2 className="card-title no-margin">{title}</h2>
  const delegationContent = (
    <Fragment>
      <div>
        <ul className="stake-pool-list">
          <li className="stake-pool-item">
            {isBigDelegator && <BigDelegatorOffer />}
            <DelegateInput value={fieldValue} onChange={handleOnInput} />
            <StakePoolInfo
              pool={stakePool}
              gettingPoolInfo={gettingPoolInfo}
              validationError={error}
            />
            <div />
          </li>
        </ul>
      </div>

      <div className="delegation-info-row">
        <label className="fee-label">
          Fee
          <AdaIcon />
        </label>
        <div className="delegation-fee" data-cy="DelegateFeeAmount">
          {printAda(delegationFee)}
        </div>
      </div>
      <div className="validation-row">
        <button
          className="button primary medium"
          disabled={
            !isShelleyCompatible ||
            validationError ||
            calculatingDelegationFee ||
            !stakePool?.poolHash
          }
          data-cy="DelegateButton"
          onClick={delegationHandler}
          {...tooltip(
            'You are using Shelley incompatible wallet. To delegate your ADA, follow the instructions to convert your wallet.',
            !isShelleyCompatible
          )}
        >
          Delegate
        </button>
        {[
          calculatingDelegationFee ? (
            <CalculatingFee />
          ) : (
            <DelegationValidation
              delegationValidationError={delegationValidationError}
              txSuccessTab={txSuccessTab}
            />
          ),
        ]}
      </div>
    </Fragment>
  )

  return (
    <div className="delegate card">
      {withAccordion ? (
        <Accordion
          initialVisibility={
            poolRecommendation.shouldShowSaturatedBanner || !Object.keys(currentDelegation).length
          }
          header={delegationHeader}
          body={delegationContent}
        />
      ) : (
        <Fragment>
          {delegationHeader}
          {delegationContent}
        </Fragment>
      )}
    </div>
  )
}

Delegate.defaultProps = {
  withAccordion: true,
  title: 'Delegate Stake',
}

export default Delegate
