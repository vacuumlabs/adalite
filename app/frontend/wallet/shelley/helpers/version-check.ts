import {MINIMAL_LEDGER_APP_VERSION as minimal} from '../../constants'

interface Version {
  major: string
  minor: string
  patch: string
}

export const hasMinimalVersion = (currentVersionStr: Version) => {
  const current = {
    major: parseInt(currentVersionStr.major),
    minor: parseInt(currentVersionStr.minor),
    patch: parseInt(currentVersionStr.patch),
  }

  return (
    current.major > minimal.major ||
    (current.major == minimal.major && current.minor > minimal.minor) ||
    (current.major == minimal.major &&
      current.minor == minimal.minor &&
      current.patch >= minimal.patch)
  )
}
