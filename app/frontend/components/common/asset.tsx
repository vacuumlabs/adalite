import {h} from 'preact'
import printAda from '../../helpers/printAda'
import {AssetFamily, Lovelace, Token} from '../../types'
import {HomePageIcon, QuestionFillIcon, StarIcon} from './svg'
import LinkIcon from './linkIcon'
import {StringEllipsis} from '../pages/stringEllipsis'
import {useSelector} from '../../helpers/connect'
import styles from './asset.module.scss'

type LinkToAssetProps = {
  policyIdHex: string
  assetNameHex: string
}

export const LinkToAsset = ({policyIdHex, assetNameHex}: LinkToAssetProps) => (
  <LinkIcon url={`https://cardanoscan.io/token/${policyIdHex}.${assetNameHex}`} />
)

type FormattedAssetItemProps = Token & {
  fingerprint: string
  assetNameHex: string
  type: AssetFamily
  star?: boolean
}

// Use to share common formatting, but allow for usage in different layouts
export const FormattedAssetItem = ({
  type,
  assetName,
  assetNameHex,
  policyId,
  fingerprint,
  quantity,
  children,
}: FormattedAssetItemProps & {
  children: (props: {
    icon: h.JSX.Element
    formattedAssetName: h.JSX.Element | string
    formattedAssetLink: h.JSX.Element
    formattedAmount: string
    formattedPolicy: h.JSX.Element
    formattedFingerprint: h.JSX.Element
    formattedDescription: h.JSX.Element
    formattedTicker: h.JSX.Element
    formattedUrl: h.JSX.Element
  }) => h.JSX.Element
}) => {
  const metadata = useSelector((state) => state.tokensMetadata[`${policyId}${assetNameHex}`])

  const Icon = () => {
    if (type === AssetFamily.ADA) return <StarIcon />
    if (metadata) {
      if (metadata.logoHex) {
        return (
          <img
            src={`data:image/png;base64,${metadata.logoHex}`}
            alt="logo"
            width="12"
            height="12"
          />
        )
      } else {
        return <StarIcon />
      }
    } else {
      return <QuestionFillIcon />
    }
  }

  return children({
    icon: (
      <div className={styles.icon}>
        <Icon />
      </div>
    ),
    formattedAssetName: `${assetName}${metadata?.ticker ? ` (${metadata?.ticker})` : ''}` || (
      <span className="empty">
        {'<'}no-name{'>'}
      </span>
    ),
    formattedAssetLink: type === AssetFamily.TOKEN && (
      <LinkToAsset policyIdHex={policyId} assetNameHex={assetNameHex} />
    ),
    formattedAmount:
      type === AssetFamily.TOKEN ? `${quantity}` : printAda(Math.abs(quantity) as Lovelace),
    formattedPolicy: policyId && (
      <div className="multi-asset-hash">
        <StringEllipsis value={policyId} length={6} />
      </div>
    ),
    formattedFingerprint: fingerprint && (
      <div className="multi-asset-hash">
        <StringEllipsis value={fingerprint} length={6} />
      </div>
    ),
    formattedDescription: metadata?.description && <div>{metadata.description}</div>,
    formattedTicker: metadata?.ticker && <div>{metadata.ticker}</div>,
    formattedUrl: metadata?.url && (
      <div className={styles.homepage}>
        <HomePageIcon />
        <a href={metadata.url}>{metadata.url}</a>
      </div>
    ),
  })
}
