import {AssetType, Token} from '../../../frontend/types'
import NamedError from '../NamedError'
import {AssetDataProvider} from './types'

const createAssetDataProvider = (
  assetType: AssetType,
  underlyingToken?: Token
): AssetDataProvider => {
  if (assetType === AssetType.TOKEN && underlyingToken == null) {
    throw NamedError('InvalidDataProviderInitilization')
  }

  const isToken = assetType === AssetType.TOKEN
  const isADA = assetType === AssetType.ADA

  return {
    isToken,
    isADA,
    getTokenPolicyId: () => (isToken ? underlyingToken.policyId : null),
    getTokenAssetName: () => (isToken ? underlyingToken.assetName : 'ADA'),
  }
}

export {createAssetDataProvider}
