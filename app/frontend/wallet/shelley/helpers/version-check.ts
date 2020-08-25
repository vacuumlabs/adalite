import {
  MINIMAL_LEDGER_APP_VERSION as minimalVersion,
  RECOMMENDED_LEDGER_APP_VERSION as recommendedVersion,
} from '../../constants'

interface Version {
  major: string
  minor: string
  patch: string
}

export const hasMinimalVersion = (currentVersionStr: Version, recommended: boolean) => {
  const current = {
    major: parseInt(currentVersionStr.major, 10),
    minor: parseInt(currentVersionStr.minor, 10),
    patch: parseInt(currentVersionStr.patch, 10),
  }

  const required = recommended ? recommendedVersion : minimalVersion

  return (
    current.major > required.major ||
    (current.major === required.major && current.minor > required.minor) ||
    (current.major === required.major &&
      current.minor === required.minor &&
      current.patch >= required.patch)
  )
}
