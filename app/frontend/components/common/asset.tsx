import {h} from 'preact'
import printAda from '../../helpers/printAda'
import {AssetFamily, Lovelace, RegisteredTokenMetadata, Token} from '../../types'
import {AdaIcon, HomePageIcon, QuestionFillIcon, StarIcon} from './svg'
import LinkIcon from './linkIcon'
import {StringEllipsis} from '../pages/stringEllipsis'
import {useSelector} from '../../helpers/connect'
import styles from './asset.module.scss'
import {assetNameHex2Readable} from '../../wallet/shelley/helpers/addresses'
import printTokenAmount from '../../helpers/printTokenAmount'
import {createTokenRegistrySubject} from '../../../frontend/tokenRegistry/tokenRegistry'

type LinkToAssetProps = {
  policyIdHex: string
  assetNameHex: string
}

export const LinkToAsset = ({policyIdHex, assetNameHex}: LinkToAssetProps) => (
  <LinkIcon url={`https://cardanoscan.io/token/${policyIdHex}.${assetNameHex}`} />
)

export type FormattedAssetItemProps = Token & {
  fingerprint: string | null
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
    formattedAssetIconName: h.JSX.Element
    formattedAssetLink: h.JSX.Element | null
    formattedAmount: string
    formattedPolicy: h.JSX.Element | null
    formattedFingerprint: h.JSX.Element | null
    formattedDescription: h.JSX.Element | null
    formattedTicker: h.JSX.Element | null
    formattedUrl: h.JSX.Element | null
  }) => h.JSX.Element
}) => {
  const metadata = useSelector((state) =>
    state.tokensMetadata.get(createTokenRegistrySubject(policyId, assetName))
  )

  const Icon = () => {
    if (type === AssetFamily.ADA) return <AdaIcon />
    if (metadata) {
      if (metadata.logoBase64) {
        return (
          <img
            src={`data:image/png;base64,${metadata.logoBase64}`}
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

  const formatAssetName = (assetNameHex: string, metadata: RegisteredTokenMetadata | undefined) => {
    if (metadata?.name) {
      return metadata.name
    } else if (assetName) {
      return assetNameHex2Readable(assetNameHex)
    }
    return '<no name>'
  }

  const FormattedAssetName = () => {
    if (type === AssetFamily.ADA) return <span className={styles.assetName}>ADA</span>
    return (
      <span>
        {
          <span className={metadata || assetName ? styles.assetName : styles.empty}>
            {formatAssetName(assetName, metadata)}
          </span>
        }
        <span className={styles.assetName}>{metadata?.ticker ? ` (${metadata?.ticker})` : ''}</span>
      </span>
    )
  }

  const FormattedAmount = () => {
    if (type === AssetFamily.TOKEN) {
      return printTokenAmount(quantity, metadata?.decimals || 0)
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
    formattedAssetIconName: (
      <div className={styles.iconName}>
        <Icon />
        <FormattedAssetName />
      </div>
    ),
    formattedAssetLink:
      type === AssetFamily.TOKEN ? (
        <LinkToAsset policyIdHex={policyId} assetNameHex={assetName} />
      ) : null,
    formattedAmount: FormattedAmount(),
    formattedPolicy: policyId ? (
      <div className="multi-asset-hash">
        <StringEllipsis value={policyId} length={6} />
      </div>
    ) : null,
    formattedFingerprint: fingerprint ? (
      <div className="multi-asset-hash">
        <StringEllipsis value={fingerprint} length={6} />
      </div>
    ) : null,
    formattedDescription: metadata?.description ? <div>{metadata.description}</div> : null,
    formattedTicker: metadata?.ticker ? <div>{metadata.ticker}</div> : null,
    formattedUrl: metadata?.url ? (
      <div className={styles.homepage}>
        <HomePageIcon />
        <a href={metadata.url}>{metadata.url}</a>
      </div>
    ) : null,
  })
}
