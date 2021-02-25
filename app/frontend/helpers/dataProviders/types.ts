export type AssetDataProvider = {
  isADA: boolean
  isToken: boolean
  getTokenPolicyId: () => string
  getTokenAssetName: () => string
}
