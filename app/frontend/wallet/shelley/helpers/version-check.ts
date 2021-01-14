import {LEDGER_VERSIONS} from '../../constants'

interface Version {
  major: string
  minor: string
  patch: string
}

export const hasRequiredVersion = (currentVersionStr: Version, requiredVersionType: string) => {
  const current = {
    major: parseInt(currentVersionStr.major, 10),
    minor: parseInt(currentVersionStr.minor, 10),
    patch: parseInt(currentVersionStr.patch, 10),
  }

  const required = LEDGER_VERSIONS[requiredVersionType]

  return (
    current.major > required.major ||
    (current.major === required.major && current.minor > required.minor) ||
    (current.major === required.major &&
      current.minor === required.minor &&
      current.patch >= required.patch)
  )
}
