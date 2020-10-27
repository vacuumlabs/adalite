import {
  TxInput,
  TxOutput,
  TxStakingKeyRegistrationCert,
  TxStakingKeyDeregistrationCert,
  TxDelegationCert,
  TxCertificateKeys,
  TxStakepoolRegistrationCert,
  TxMultiHostNameRelay,
  TxSingleHostIPRelay,
  TxSingleHostNameRelay,
  TxRelayTypes,
} from './types'

export const isArrayOfType = <T>(test: any, valueGuard: (test: any) => boolean): test is T[] =>
  Array.isArray(test) && (test as any[]).every((value) => valueGuard(value))

export const isTxInput = (test: any): test is TxInput =>
  test.length === 2 && Buffer.isBuffer(test[0]) && Number.isInteger(test[1])

export const isTxOutput = (test: any): test is TxOutput =>
  test.length === 2 && Buffer.isBuffer(test[0]) && Number.isInteger(test[1])

export const isWithdrawalsMap = (test: any): test is Map<Buffer, number> =>
  test instanceof Map &&
  Array.from(test.keys()).every((value) => Buffer.isBuffer(value)) &&
  Array.from(test.values()).every((value) => Number.isInteger(value))

export const isTxStakingKeyRegistrationCert = (test: any): test is TxStakingKeyRegistrationCert =>
  Array.isArray(test) &&
  test.length === 2 &&
  test[0] === TxCertificateKeys.STAKING_KEY_REGISTRATION &&
  Array.isArray(test[1]) &&
  test[1].length === 2 &&
  Number.isInteger(test[1][0]) &&
  Buffer.isBuffer(test[1][1])

export const isStakingKeyDeregistrationCert = (test: any): test is TxStakingKeyDeregistrationCert =>
  Array.isArray(test) &&
  test.length === 2 &&
  test[0] === TxCertificateKeys.STAKING_KEY_DEREGISTRATION &&
  Array.isArray(test[1]) &&
  test[1].length === 2 &&
  Number.isInteger(test[1][0]) &&
  Buffer.isBuffer(test[1][1])

export const isDelegationCert = (test: any): test is TxDelegationCert =>
  Array.isArray(test) &&
  test.length === 3 &&
  test[0] === TxCertificateKeys.DELEGATION &&
  Array.isArray(test[1]) &&
  test[1].length === 2 &&
  Number.isInteger(test[1][0]) &&
  Buffer.isBuffer(test[1][1]) &&
  Buffer.isBuffer(test[2])

export const isTxSingleHostIPRelay = (test: any): test is TxSingleHostIPRelay =>
  Array.isArray(test) &&
  test.length <= 4 &&
  test[0] === TxRelayTypes.SINGLE_HOST_IP &&
  (test[1] === null || Number.isInteger(test[1])) &&
  (test[2] === null || Buffer.isBuffer(test[2])) &&
  (test[3] === null || Buffer.isBuffer(test[3]))

export const isTxSingleHostNameRelay = (test: any): test is TxSingleHostNameRelay =>
  Array.isArray(test) &&
  test.length === 3 &&
  test[0] === TxRelayTypes.SINGLE_HOST_NAME &&
  Number.isInteger(test[1]) &&
  typeof test[2] === 'string'

export const isTxMultiHostNameRelay = (test: any): test is TxMultiHostNameRelay =>
  Array.isArray(test) &&
  test.length === 2 &&
  test[0] === TxRelayTypes.MULTI_HOST_NAME &&
  typeof test[1] === 'string'

const isMargin = (test: any) =>
  typeof test === 'object' &&
  'value' in test &&
  0 in test.value &&
  Number.isInteger(test.value[0]) &&
  1 in test.value &&
  Number.isInteger(test.value[1])

const isMetaData = (test: any) =>
  test === null ||
  (Array.isArray(test) &&
    test.length === 2 &&
    typeof test[0] === 'string' &&
    Buffer.isBuffer(test[1]))

export const isStakepoolRegistrationCert = (test: any): test is TxStakepoolRegistrationCert =>
  Array.isArray(test) &&
  test.length === 10 &&
  test[0] === TxCertificateKeys.STAKEPOOL_REGISTRATION &&
  Buffer.isBuffer(test[1]) &&
  Buffer.isBuffer(test[2]) &&
  Number.isInteger(test[3]) &&
  Number.isInteger(test[4]) &&
  isMargin(test[5]) &&
  Buffer.isBuffer(test[6]) &&
  isArrayOfType<Buffer>(test[7], Buffer.isBuffer) &&
  Array.isArray(test[8]) &&
  isMetaData(test[9])
