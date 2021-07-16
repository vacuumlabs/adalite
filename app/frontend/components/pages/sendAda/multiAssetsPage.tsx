import {Fragment, h} from 'preact'
import {useSelector} from '../../../helpers/connect'
import {getSourceAccountInfo, State} from '../../../state'
import {AssetFamily, Token} from '../../../types'
import {
  assetNameHex2Readable,
  encodeAssetFingerprint,
} from '../../../wallet/shelley/helpers/addresses'
import {FormattedAssetItem} from '../../common/asset'
import CopyOnClick from '../../common/copyOnClick'
import {useState} from 'preact/hooks'
import styles from './multiAssetsPage.module.scss'
import {DropdownCaret} from '../../common/svg'

const MultiAssetsPage = () => {
  const {tokenBalance} = useSelector((state: State) => getSourceAccountInfo(state))

  const [expandedAsset, setExpandedAsset] = useState(-1)

  type MultiAsset = {
    assetNameHex: string
    assetName: string
    fingerprint: string
    type: AssetFamily
    policyId: string
    quantity: number
  }

  const multiAssets: MultiAsset[] = [
    ...tokenBalance
      .sort((a: Token, b: Token) => b.quantity - a.quantity)
      .map((token: Token) => ({
        ...token,
        assetNameHex: token.assetName,
        assetName: assetNameHex2Readable(token.assetName),
        fingerprint: encodeAssetFingerprint(token.policyId, token.assetName),
        type: AssetFamily.TOKEN,
      })),
  ]

  if (!tokenBalance.length) return null

  return (
    <div className="card">
      <h2 className="card-title">Digital assets</h2>
      <div className="multi-assets-page-list">
        {multiAssets.map((asset, i) => (
          <FormattedAssetItem key={asset?.assetName} {...asset}>
            {({
              icon,
              formattedAssetName,
              formattedAssetLink,
              formattedAmount,
              formattedPolicy,
              formattedFingerprint,
              formattedDescription,
              formattedUrl,
            }) => {
              const isExpanded = i === expandedAsset
              const header = (
                <div
                  className={styles.header}
                  onClick={() => {
                    if (i === expandedAsset) {
                      setExpandedAsset(-1)
                    } else {
                      setExpandedAsset(i)
                    }
                  }}
                >
                  <div className={styles.name}>
                    {icon}
                    {formattedAssetName}
                    {formattedAssetLink}
                  </div>
                  <div className={styles.right}>
                    <div className={styles.amount}>{formattedAmount}</div>
                    <div
                      className={`accordion-icon flex-end ${isExpanded ? 'shown' : 'hidden'}`}
                      data-cy="ReceiveAddressAccordion"
                    >
                      <DropdownCaret />
                    </div>
                  </div>
                </div>
              )
              const details = (
                <div className={`${styles.details} ${isExpanded ? styles.expanded : ''}`}>
                  <div className="multi-asset-page-policy">
                    <CopyOnClick
                      value={asset?.policyId}
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
                      value={asset?.fingerprint}
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
                  {formattedDescription && (
                    <Fragment>
                      <div className={styles.detailsLabel}>Details</div>
                      {formattedDescription}
                      {formattedUrl && <div className={styles.homepage}>{formattedUrl}</div>}
                    </Fragment>
                  )}
                </div>
              )
              return (
                <div className={`${styles.asset} ${isExpanded ? styles.expanded : ''}`}>
                  {header}
                  {details}
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
