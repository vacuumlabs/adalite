import {h} from 'preact'
import {useSelector} from '../../../helpers/connect'
import {getSourceAccountInfo, State} from '../../../state'
import {AssetFamily, Token} from '../../../types'
import {
  assetNameHex2Readable,
  encodeAssetFingerprint,
} from '../../../wallet/shelley/helpers/addresses'
import {FormattedAssetItem} from '../../common/asset'
import CopyOnClick from '../../common/copyOnClick'

const MultiAssetsPage = () => {
  const {tokenBalance} = useSelector((state: State) => getSourceAccountInfo(state))

  const multiAssets = [
    ...tokenBalance
      .sort((a: Token, b: Token) => b.quantity - a.quantity)
      .map((token: Token) => ({
        ...token,
        assetNameHex: token.assetName,
        assetName: assetNameHex2Readable(token.assetName),
        fingerprint: encodeAssetFingerprint(token.policyId, token.assetName),
        type: AssetFamily.TOKEN,
        star: false,
      })),
  ]

  if (!tokenBalance.length) return null

  // For now the layout is very similar as in `sendAdaPage`, however we expect it to change,
  // therefore the duplication to allow for more versatility later on
  return (
    <div className="card">
      <h2 className="card-title">Digital assets</h2>
      <div className="multi-assets-page-list">
        {multiAssets.map((asset) => (
          <FormattedAssetItem key={asset.assetName} {...asset}>
            {({
              starIcon,
              formattedAssetName,
              formattedAssetLink,
              formattedAmount,
              formattedPolicy,
              formattedFingerprint,
            }) => {
              return (
                <div className="multi-asset-page-item multi-asset-item">
                  <div className="multi-asset-name-amount">
                    <div className="multi-asset-name">
                      {starIcon}
                      {formattedAssetName}
                      {formattedAssetLink}
                    </div>
                    <div className="multi-asset-amount">{formattedAmount}</div>
                  </div>
                  <div className="multi-asset-page-policy">
                    <CopyOnClick
                      value={asset.policyId}
                      elementClass="copy"
                      tooltipMessage="Policy id copied to clipboard"
                    >
                      <div className="multi-asset-page-copy-on-click">
                        {formattedPolicy}
                        <div className="desktop">
                          <span className="copy-text margin-left" />
                        </div>
                      </div>
                    </CopyOnClick>
                  </div>
                  <div className="multi-asset-page-policy">
                    <CopyOnClick
                      value={asset.fingerprint}
                      elementClass="copy"
                      tooltipMessage="Fingerprint copied to clipboard"
                    >
                      <div className="multi-asset-page-copy-on-click">
                        {formattedFingerprint}
                        <div className="desktop">
                          <span className="copy-text margin-left" />
                        </div>
                      </div>
                    </CopyOnClick>
                  </div>
                </div>
              )
            }}
          </FormattedAssetItem>
        ))}
      </div>
    </div>
  )
}

export default MultiAssetsPage
