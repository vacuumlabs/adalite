import {h} from 'preact'
import printAda from '../../helpers/printAda'
import {AssetFamily, Lovelace, RegisteredTokenMetadata, Token} from '../../types'
import {AdaIcon, HomePageIcon, CircleFillIcon, StarIcon} from './svg'
import LinkIcon from './linkIcon'
import {StringEllipsis} from '../pages/stringEllipsis'
import {useSelector} from '../../helpers/connect'
import styles from './asset.module.scss'
import {assetNameHex2Readable} from '../../wallet/shelley/helpers/addresses'
import printTokenAmount from '../../helpers/printTokenAmount'
import {createTokenRegistrySubject} from '../../../frontend/tokenRegistry/tokenRegistry'
import {getCexplorerUrl} from '../../../frontend/helpers/common'

const isHumanReadable = (value: string): boolean =>
  // eslint-disable-next-line no-useless-escape
  !!value && /^[a-zA-Z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/.test(value)

type LinkToAssetProps = {
  policyIdHex: string
  assetNameHex: string
}

export const LinkToAsset = ({policyIdHex, assetNameHex}: LinkToAssetProps) => (
  <LinkIcon url={`${getCexplorerUrl()}/asset/${policyIdHex}.${assetNameHex}`} />
)

type IconProps = {
  type: AssetFamily
  metadata: RegisteredTokenMetadata | null
}

const Icon = ({type, metadata}: IconProps) => {
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
    return <CircleFillIcon />
  }
}

export const enum FormattedHumanReadableLabelType {
  ADA,
  OFFCHAIN_ASSET_NAME,
  ONCHAIN_ASSET_NAME,
  FINGERPRINT,
}

type GetLabelVariantsArgs =
  | {
      type: AssetFamily.ADA
    }
  | {
      type: AssetFamily.TOKEN
      metadata: RegisteredTokenMetadata
      assetName: string
      fingerprint: string
    }

const getLabelVariants = (args: GetLabelVariantsArgs) => {
  if (args.type === AssetFamily.ADA) {
    const label = <span className={styles.assetName}>ADA</span>
    return {
      type: FormattedHumanReadableLabelType.ADA,
      label,
      labelShort: label,
    }
  }

  const {metadata, assetName, fingerprint} = args

  if (metadata?.name) {
    return {
      type: FormattedHumanReadableLabelType.OFFCHAIN_ASSET_NAME,
      label: (
        <span className={styles.assetName}>
          {`${metadata.name}${metadata?.ticker ? ` (${metadata.ticker})` : ''}`}
        </span>
      ),
      labelShort: <span className={styles.assetName}>{metadata.ticker}</span>,
    }
  }

  const readableAssetName = assetName && assetNameHex2Readable(assetName)
  if (assetName && isHumanReadable(readableAssetName)) {
    return {
      type: FormattedHumanReadableLabelType.ONCHAIN_ASSET_NAME,
      label: <span className={styles.assetName}>{readableAssetName}</span>,
      labelShort: (
        <span className={`${styles.assetName} flex-nowrap shrinkable`}>
          <div className="ellipsis">{readableAssetName}</div>
        </span>
      ),
    }
  }

  const label = (
    <span className={`${styles.assetName} flex-nowrap shrinkable`}>
      <StringEllipsis value={fingerprint!} length={6} />
    </span>
  )
  return {
    type: FormattedHumanReadableLabelType.FINGERPRINT,
    label,
    labelShort: label,
  }
}

const getFormattedLabelVariants = (
  args: GetLabelVariantsArgs
): FormattedHumanReadableLabelVariants => {
  const {type, label, labelShort} = getLabelVariants(args)

  const LabelWrapper = ({children}: {children: h.JSX.Element | h.JSX.Element[]}) => (
    <div
      className={`${styles.iconName} ${
        type === FormattedHumanReadableLabelType.FINGERPRINT ? 'flex-nowrap shrinkable' : ''
      }`}
    >
      {children}
    </div>
  )

  const icon = (
    <Icon type={args.type} metadata={args.type === AssetFamily.TOKEN ? args.metadata : null} />
  )

  return {
    type,
    label: <LabelWrapper>{label}</LabelWrapper>,
    labelWithIcon: (
      <LabelWrapper>
        <div className={`${styles.icon} ${styles.iconOffset}`}>{icon}</div>
        {label}
      </LabelWrapper>
    ),
    labelShortWithIcon: (
      <LabelWrapper>
        <div className={`${styles.icon} ${styles.iconOffset}`}>{icon}</div>
        {labelShort}
      </LabelWrapper>
    ),
  }
}

export type FormattedAssetItemProps = Token & {
  fingerprint: string | null
  type: AssetFamily
}

type FormattedHumanReadableLabelVariants = {
  type: FormattedHumanReadableLabelType
  label: h.JSX.Element
  labelWithIcon: h.JSX.Element
  labelShortWithIcon: h.JSX.Element
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
    formattedHumanReadableLabelVariants: FormattedHumanReadableLabelVariants
    formattedOnChainName: h.JSX.Element | null
    formattedOffChainName: h.JSX.Element | null
    formattedAssetLink: h.JSX.Element | null
    formattedAmount: string
    formattedPolicy: h.JSX.Element | null
    formattedFingerprint: h.JSX.Element | null
    formattedDescription: h.JSX.Element | null
    formattedTicker: h.JSX.Element | null
    formattedUrl: h.JSX.Element | null
  }) => h.JSX.Element
}) => {
  const missingValue = 'N / A'

  const metadata = useSelector((state) =>
    state.tokensMetadata.get(createTokenRegistrySubject(policyId, assetName))
  )

  return children({
    icon: (
      <div className={styles.icon}>
        <Icon type={type} metadata={metadata ?? null} />
      </div>
    ),
    formattedHumanReadableLabelVariants: getFormattedLabelVariants(
      type === AssetFamily.ADA
        ? {type}
        : {
          type,
          metadata: metadata!,
          assetName,
          fingerprint: fingerprint!,
        }
    ),
    formattedOnChainName: (() => {
      if (type !== AssetFamily.TOKEN) return null

      if (!assetName) {
        return <span className={styles.empty}>{missingValue}</span>
      }

      const readableAssetName = assetNameHex2Readable(assetName)
      return (
        <span className={`${styles.assetName} flex-nowrap shrinkable`}>
          <StringEllipsis
            value={isHumanReadable(readableAssetName) ? readableAssetName : `${assetName} (hex)`}
            length={12}
          />
        </span>
      )
    })(),
    formattedOffChainName:
      type === AssetFamily.TOKEN ? (
        <span>
          {
            <span className={metadata ? styles.assetName : styles.empty}>
              {metadata?.name || missingValue}
            </span>
          }
          <span className={styles.assetName}>
            {metadata?.ticker ? ` (${metadata?.ticker})` : ''}
          </span>
        </span>
      ) : null,
    formattedAssetLink:
      type === AssetFamily.TOKEN ? (
        <LinkToAsset policyIdHex={policyId} assetNameHex={assetName} />
      ) : null,
    formattedAmount:
      type === AssetFamily.TOKEN
        ? printTokenAmount(quantity, metadata?.decimals || 0)
        : printAda(quantity.abs() as Lovelace),
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
    formattedTicker:
      type === AssetFamily.TOKEN ? (
        metadata?.ticker ? (
          <div>{metadata.ticker}</div>
        ) : (
          <div className={styles.empty}>{missingValue}</div>
        )
      ) : null,
    formattedUrl: metadata?.url ? (
      <div className={styles.homepage}>
        <HomePageIcon />
        <a href={metadata.url}>{metadata.url}</a>
      </div>
    ) : null,
  })
}
