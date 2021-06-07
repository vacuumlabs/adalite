// policyId is 28 bytes, assetName max 32 bytes, together with quantity makes
// max token size about 70 bytes, max output size is 4000 => 4000 / 70 ~ 50
export const MAX_OUTPUT_TOKENS = 50

export const MIN_UTXO_VALUE = 1000000
