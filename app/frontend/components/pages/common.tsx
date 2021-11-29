import toLocalDate from '../../../frontend/helpers/toLocalDate'
import {h} from 'preact'
import Alert from '../common/alert'
import {useSelector} from '../../helpers/connect'
import {CryptoProviderFeature} from '../../types'
import {CryptoProviderType} from '../../wallet/types'
import {useIsWalletFeatureSupported} from '../../selectors'

export const EpochDateTime = ({
  epoch,
  dateTime,
  className = '',
}: {
  epoch: number
  dateTime: Date
  className?: string
}) => {
  return (
    <span className={`epoch-date-time ${className}`}>
      Epoch {epoch}, {toLocalDate(dateTime)}
    </span>
  )
}

export const BitBox02MultiAssetAlert = () => {
  const cryptoProviderInfo = useSelector((state) => state.cryptoProviderInfo)
  const isMultiAssetSupported = useIsWalletFeatureSupported(CryptoProviderFeature.MULTI_ASSET)

  // checking both conditions for future-proofness, once MA support is added to BitBox02
  return !isMultiAssetSupported && cryptoProviderInfo?.type === CryptoProviderType.BITBOX02 ? (
    <Alert alertType="warning">
      BitBox02 currently does not support sending Cardano tokens/NFTs. If you received tokens and
      cannot send them, please contact{' '}
      <a href={'mailto:support@shiftcrypto.ch'}>support@shiftcrypto.ch</a>.{' '}
      <a
        href="https://shiftcrypto.support/help/en-us/35-adalite-cardano/176-adalite-guide"
        target="_blank"
        rel="noopener"
      >
        More info
      </a>
    </Alert>
  ) : null
}
