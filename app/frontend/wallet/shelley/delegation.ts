/*import {buildTransaction, calculateFee} from './helpers/chainlib-wrapper'

const {itnConfig} = require('./constants')

const chainConfig = itnConfig

export function buildTransactionDelegatingStake({address, privkey, counter, pools, value}) {
  const computedFee = calculateFee({
    chainConfig,
    inputCount: 1,
    outputCount: 0,
    certCount: 1,
  })
  if (!value || computedFee > value) throw Error('Insufficient funds')

  return buildTransaction({
    inputs: [
      {
        type: 'account',
        address,
        privkey,
        accountCounter: counter,
        value: computedFee,
      },
    ],
    outputs: [],
    cert: {
      type: 'stake_delegation',
      pools,
      privkey,
    },
    chainConfig,
  })
}
*/
