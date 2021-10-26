import {UnexpectedError, UnexpectedErrorReason} from '../../../errors'
import {
  Lovelace,
  CertificateType,
  TxPlanArgs,
  Address,
  TxType,
  SendAdaTxPlanArgs,
  DelegateAdaTxPlanArgs,
  WithdrawRewardsTxPlanArgs,
  ConvertLegacyAdaTxPlanArgs,
  DeregisterStakingKeyTxPlanArgs,
  AssetFamily,
  VotingRegistrationTxPlanArgs,
} from '../../../types'
import {isTxPlanResultSuccess} from '../../../wallet/shelley/transaction/types'
import {
  UTxO,
  TxCertificate,
  TxDelegationCert,
  TxInput,
  TxOutput,
  TxStakingKeyRegistrationCert,
  TxWithdrawal,
  TxAuxiliaryData,
} from '../../types'
import {computeTxPlan, validateTxPlan} from './computeTxPlan'
import {TxPlanDraft, TxPlanResult} from './types'
import {computeMinUTxOLovelaceAmount} from './utils'

const prepareTxPlanDraft = (txPlanArgs: TxPlanArgs): TxPlanDraft => {
  const prepareSendAdaTx = (
    txPlanArgs: SendAdaTxPlanArgs | ConvertLegacyAdaTxPlanArgs
  ): TxPlanDraft => {
    const outputs: TxOutput[] = []
    if (txPlanArgs.sendAmount.assetFamily === AssetFamily.ADA) {
      outputs.push({
        isChange: false,
        address: txPlanArgs.address,
        coins: txPlanArgs.sendAmount.coins,
        tokenBundle: [],
      })
    } else {
      outputs.push({
        isChange: false,
        address: txPlanArgs.address,
        coins: computeMinUTxOLovelaceAmount([txPlanArgs.sendAmount.token]),
        tokenBundle: [txPlanArgs.sendAmount.token],
      })
    }

    return {
      outputs,
      certificates: [],
      withdrawals: [],
      auxiliaryData: null,
    }
  }

  const prepareDelegationTx = (txPlanArgs: DelegateAdaTxPlanArgs): TxPlanDraft => {
    const certificates: TxCertificate[] = []
    if (!txPlanArgs.isStakingKeyRegistered) {
      const registrationCertificate: TxStakingKeyRegistrationCert = {
        type: CertificateType.STAKING_KEY_REGISTRATION,
        stakingAddress: txPlanArgs.stakingAddress,
      }
      certificates.push(registrationCertificate)
    }
    if (txPlanArgs.poolHash) {
      const delegationCertificate: TxDelegationCert = {
        type: CertificateType.DELEGATION,
        stakingAddress: txPlanArgs.stakingAddress,
        poolHash: txPlanArgs.poolHash,
      }
      certificates.push(delegationCertificate)
    }
    return {
      outputs: [],
      certificates,
      withdrawals: [],
      auxiliaryData: null,
    }
  }

  const prepareWithdrawalTx = (txPlanArgs: WithdrawRewardsTxPlanArgs): TxPlanDraft => {
    const withdrawals: TxWithdrawal[] = []
    withdrawals.push({stakingAddress: txPlanArgs.stakingAddress, rewards: txPlanArgs.rewards})
    return {
      outputs: [],
      certificates: [],
      withdrawals,
      auxiliaryData: null,
    }
  }

  const prepareDeregisterStakingKeyTx = (
    txPlanArgs: DeregisterStakingKeyTxPlanArgs
  ): TxPlanDraft => {
    const {withdrawals, outputs} = prepareWithdrawalTx({
      txType: TxType.WITHDRAW,
      rewards: txPlanArgs.rewards,
      stakingAddress: txPlanArgs.stakingAddress,
    })
    const certificates: TxCertificate[] = [
      {
        type: CertificateType.STAKING_KEY_DEREGISTRATION,
        stakingAddress: txPlanArgs.stakingAddress,
      },
    ]
    return {
      outputs,
      certificates,
      withdrawals: withdrawals.filter((w) => w.rewards > 0),
      auxiliaryData: null,
    }
  }

  const prepareVotingRegistrationTx = (txPlanArgs: VotingRegistrationTxPlanArgs): TxPlanDraft => {
    const {votingPubKey, stakePubKey, nonce, stakingAddress} = txPlanArgs
    const auxiliaryData: TxAuxiliaryData = {
      type: 'CATALYST_VOTING',
      votingPubKey,
      stakePubKey,
      rewardDestinationAddress: {
        address: stakingAddress,
        stakingPath: null,
      },
      nonce,
    }
    return {
      outputs: [],
      certificates: [],
      withdrawals: [],
      auxiliaryData,
    }
  }

  switch (txPlanArgs.txType) {
    case TxType.SEND_ADA:
      return prepareSendAdaTx(txPlanArgs)
    case TxType.DELEGATE:
      return prepareDelegationTx(txPlanArgs)
    case TxType.DEREGISTER_STAKE_KEY:
      return prepareDeregisterStakingKeyTx(txPlanArgs)
    case TxType.WITHDRAW:
      return prepareWithdrawalTx(txPlanArgs)
    case TxType.CONVERT_LEGACY:
      return prepareSendAdaTx(txPlanArgs)
    case TxType.REGISTER_VOTING:
      return prepareVotingRegistrationTx(txPlanArgs)
    default:
      throw new UnexpectedError(UnexpectedErrorReason.InvalidTxPlanType)
  }
}

export const selectMinimalTxPlan = (
  utxos: Array<UTxO>,
  changeAddress: Address,
  txPlanArgs: TxPlanArgs
): TxPlanResult | undefined => {
  const {outputs, certificates, withdrawals, auxiliaryData} = prepareTxPlanDraft(txPlanArgs)
  const change: TxOutput = {
    isChange: false,
    address: changeAddress,
    coins: 0 as Lovelace,
    tokenBundle: [],
  }

  let txPlanResult: TxPlanResult | undefined
  let numInputs = 0
  while (numInputs <= utxos.length) {
    const inputs: TxInput[] = utxos.slice(0, numInputs)
    txPlanResult = validateTxPlan(
      computeTxPlan(inputs, outputs, change, certificates, withdrawals, auxiliaryData)
    )
    if (isTxPlanResultSuccess(txPlanResult)) {
      if (txPlanResult.txPlan.baseFee === txPlanResult.txPlan.fee || numInputs === utxos.length) {
        return txPlanResult
      }
    }
    numInputs += 1
  }
  return txPlanResult
}
