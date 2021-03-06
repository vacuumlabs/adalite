import {h} from 'preact'
import printAda from '../../helpers/printAda'
import {AssetFamily, Lovelace, Token} from '../../types'
import {StarIcon} from './svg'
import LinkIcon from './linkIcon'
import {StringEllipsis} from '../pages/stringEllipsis'

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
  star,
  assetName,
  assetNameHex,
  policyId,
  fingerprint,
  quantity,
  children,
}: FormattedAssetItemProps & {
  children: (props: {
    starIcon: h.JSX.Element
    formattedAssetName: h.JSX.Element | string
    formattedAssetLink: h.JSX.Element
    formattedAmount: string
    formattedPolicy: h.JSX.Element
    formattedFingerprint: h.JSX.Element
  }) => h.JSX.Element
}) => {
  return children({
    starIcon: star && <StarIcon />,
    formattedAssetName: assetName || (
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
  })
}
