import {h, Fragment} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'
import tooltip from '../../common/tooltip'
import printAda from '../../../helpers/printAda'
import {AdaIcon} from '../../common/svg'
import {getTranslation} from '../../../translations'
import ConfirmTransactionDialog from '../../pages/sendAda/confirmTransactionDialog'
import {getSourceAccountInfo, State} from '../../../state'
import Accordion from '../../common/accordion'
import {Lovelace, PoolRecommendation, Stakepool} from '../../../types'
import {StakePoolInfo} from './stakePoolInfo'
import DelegateInput from './delegateInput'

const CalculatingFee = (): h.JSX.Element => (
  <div className="validation-message send">Calculating fee...</div>
)

type DelegationValidationProps = {
  delegationValidationError: any
  txSuccessTab: string
}

const DelegationValidation = ({
  delegationValidationError,
  txSuccessTab,
}: DelegationValidationProps): h.JSX.Element =>
  txSuccessTab === 'stake' && !delegationValidationError ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    delegationValidationError && (
      <div className="validation-message error">
        {getTranslation(delegationValidationError.code)}
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

interface Props {
  stakePool: Stakepool
  delegationFee: Lovelace
  calculatingDelegationFee: boolean
  delegationValidationError: any
  isShelleyCompatible: boolean
  shouldShowConfirmTransactionDialog: boolean
  txSuccessTab: string
  gettingPoolInfo: boolean
  poolRecommendation: PoolRecommendation
  pool: Stakepool
  isBigDelegator: boolean
  withAccordion: boolean
  title: string
  confirmTransaction: (txConfirmType) => Promise<void>
  selectAdaliteStakepool: () => void
}

const Delegate = ({
  stakePool,
  delegationFee,
  calculatingDelegationFee,
  delegationValidationError,
  isShelleyCompatible,
  shouldShowConfirmTransactionDialog,
  txSuccessTab,
  gettingPoolInfo,
  poolRecommendation,
  pool,
  isBigDelegator,
  withAccordion,
  title,
  confirmTransaction,
}: Props): h.JSX.Element => {
  const delegationHandler = async (): Promise<void> => {
    await confirmTransaction('delegate')
  }

  const validationError = !!delegationValidationError || !stakePool || !!stakePool.validationError
  const delegationHeader = <h2 className="card-title no-margin">{title}</h2>
  const delegationContent = (
    <Fragment>
      <div>
        <ul className="stake-pool-list">
          <li className="stake-pool-item">
            {isBigDelegator && <BigDelegatorOffer />}
            <DelegateInput />
            <StakePoolInfo pool={stakePool} gettingPoolInfo={gettingPoolInfo} />
            <div />
          </li>
        </ul>
      </div>

      <div className="delegation-info-row">
        <label className="fee-label">
          Fee
          <AdaIcon />
        </label>
        <div className="delegation-fee">{printAda(delegationFee)}</div>
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
      {shouldShowConfirmTransactionDialog && <ConfirmTransactionDialog isDelegation />}
    </Fragment>
  )

  return (
    <div className="delegate card">
      {withAccordion ? (
        <Accordion
          initialVisibility={
            poolRecommendation.shouldShowSaturatedBanner || !Object.keys(pool).length
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

export default connect(
  (state: State) => ({
    stakePool: state.shelleyDelegation.selectedPool,
    calculatingDelegationFee: state.calculatingDelegationFee,
    delegationFee: state.shelleyDelegation.delegationFee,
    delegationValidationError: state.delegationValidationError,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    txSuccessTab: state.txSuccessTab,
    gettingPoolInfo: state.gettingPoolInfo,
    isShelleyCompatible: state.isShelleyCompatible,
    poolRecommendation: getSourceAccountInfo(state).poolRecommendation,
    pool: getSourceAccountInfo(state).shelleyAccountInfo.delegation,
    isBigDelegator: state.isBigDelegator,
  }),
  actions
)(Delegate)
