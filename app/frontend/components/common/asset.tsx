import {h} from 'preact'
import printAda from '../../helpers/printAda'
import {AssetFamily, Lovelace, Token} from '../../types'
import {AdaIcon, HomePageIcon, QuestionFillIcon, StarIcon} from './svg'
import LinkIcon from './linkIcon'
import {StringEllipsis} from '../pages/stringEllipsis'
import {useSelector} from '../../helpers/connect'
import styles from './asset.module.scss'
import {assetNameHex2Readable} from '../../wallet/shelley/helpers/addresses'

type LinkToAssetProps = {
  policyIdHex: string
  assetNameHex: string
}

export const LinkToAsset = ({policyIdHex, assetNameHex}: LinkToAssetProps) => (
  <LinkIcon url={`https://cardanoscan.io/token/${policyIdHex}.${assetNameHex}`} />
)

export type FormattedAssetItemProps = Token & {
  fingerprint: string
  type: AssetFamily
}

// Use to share common formatting, but allow for usage in different layouts
export const FormattedAssetItem = ({
  type,
  assetName,
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
  const metadata = useSelector((state) => state.tokensMetadata[`${policyId}${assetName}`])

  const Icon = () => {
    if (type === AssetFamily.ADA) return <AdaIcon />
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

  const FormattedAssetName = () => {
    if (type === AssetFamily.ADA) return <span className={styles.assetName}>ADA</span>
    if (assetName) {
      return (
        <span className={styles.assetName}>
          {`${assetNameHex2Readable(assetName)}${metadata?.ticker ? ` (${metadata?.ticker})` : ''}`}
        </span>
      )
    } else {
      return (
        <span className={styles.empty}>
          {'<'}no-name{'>'}
        </span>
      )
    }
  }

  const FormattedAmount = () => {
    if (type === AssetFamily.TOKEN) {
      if (metadata?.decimals) {
        return (quantity / Math.pow(10, metadata.decimals)).toFixed(metadata.decimals)
      }
      return `${quantity}`
    } else {
      return printAda(Math.abs(quantity) as Lovelace)
    }
  }

  return children({
    icon: (
      <div className={styles.icon}>
        <Icon />
      </div>
    ),
    formattedAssetName: <FormattedAssetName />,
    formattedAssetLink: type === AssetFamily.TOKEN && (
      <LinkToAsset policyIdHex={policyId} assetNameHex={assetName} />
    ),
    formattedAmount: FormattedAmount(),
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
