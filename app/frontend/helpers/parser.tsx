import {
  _Input,
  _Output,
  _DelegationCert,
  _StakingKeyRegistrationCert,
  _StakingKeyDeregistrationCert,
  _StakepoolRegistrationCert,
  _Withdrawal,
  _UnsignedTxDecoded,
  _UnsignedTxParsed,
  TxBodyKeys,
  TxCertificateKeys,
  _Certificates,
} from './parserTypes'

function parseTxInputs(txInputs: any[]): _Input[] {
  return txInputs.map(([txHash, outputIndex]): _Input => ({txHash, outputIndex}))
}

function parseTxOutputs(txOutputs: any[]): _Output[] {
  return txOutputs.map(([address, coins]): _Output => ({address, coins}))
}

function parseTxCerts(txCertificates: any[]): _Certificates {
  const stakeKeyRegistrationCertParser = ([
    type,
    [, pubKeyHash],
  ]: any): _StakingKeyRegistrationCert => ({type, pubKeyHash})

  const stakeKeyDeregistrationCertParser = ([
    type,
    [, pubKeyHash],
  ]: any): _StakingKeyDeregistrationCert => ({type, pubKeyHash})

  const delegationCertParser = ([type, [, pubKeyHash], poolHash]: any): _DelegationCert => ({
    type,
    pubKeyHash,
    poolHash,
  })

  const stakepoolRegistrationCertParser = ([
    type,
    poolKeyHashHex,
    vrfKeyHashHex,
    pledgeStr,
    costStr,
    margin,
    rewardAccountKeyHash,
    poolOwners,
    relays,
    metadata,
  ]: any): _StakepoolRegistrationCert => ({
    // TODO: check whether this is accurate and which of these we actually need{
    type,
    poolKeyHashHex,
    vrfKeyHashHex,
    pledgeStr,
    costStr,
    margin,
    rewardAccountKeyHash,
    poolOwners,
    relays,
    metadata,
  })

  type certficateParser =
    | typeof stakeKeyRegistrationCertParser
    | typeof stakeKeyDeregistrationCertParser
    | typeof delegationCertParser
    | typeof stakepoolRegistrationCertParser

  const txCertificateParsers: {[key: number]: certficateParser} = {
    [TxCertificateKeys.STAKING_KEY_REGISTRATION]: stakeKeyRegistrationCertParser,
    [TxCertificateKeys.STAKING_KEY_DEREGISTRATION]: stakeKeyDeregistrationCertParser,
    [TxCertificateKeys.DELEGATION]: delegationCertParser,
    [TxCertificateKeys.STAKEPOOL_REGISTRATION]: stakepoolRegistrationCertParser,
  }

  return txCertificates.map((certificate) => txCertificateParsers[certificate[0]](certificate))
}

function parseTxWithdrawals(withdrawals: Map<Buffer, number>): _Withdrawal[] {
  return Array.from(withdrawals).map(([address, coins]): _Withdrawal => ({address, coins}))
}

function parseUnsignedTx([txBody, meta]: _UnsignedTxDecoded): _UnsignedTxParsed {
  const inputs = parseTxInputs(txBody.get(TxBodyKeys.INPUTS))
  const outputs = parseTxOutputs(txBody.get(TxBodyKeys.OUTPUTS))
  const fee = `${txBody.get(TxBodyKeys.FEE)}`
  const ttl = `${txBody.get(TxBodyKeys.TTL)}`
  const certificates = parseTxCerts(txBody.get(TxBodyKeys.CERTIFICATES) || [])
  const withdrawals = parseTxWithdrawals(txBody.get(TxBodyKeys.WITHDRAWALS) || new Map())
  const metaDataHash = txBody.get(TxBodyKeys.META_DATA_HASH) as Buffer
  return {
    inputs,
    outputs,
    fee,
    ttl,
    certificates,
    withdrawals,
    metaDataHash,
    meta,
  }
}

export {parseUnsignedTx}
