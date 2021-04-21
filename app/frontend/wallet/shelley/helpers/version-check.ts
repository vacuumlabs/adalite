// TODO: type version
export const hasRequiredVersion = (currentVersionStr, requiredVersionStr) => {
  const current = {
    major: parseInt(currentVersionStr.major, 10),
    minor: parseInt(currentVersionStr.minor, 10),
    patch: parseInt(currentVersionStr.patch, 10),
  }

  const required = {
    major: parseInt(requiredVersionStr.major, 10),
    minor: parseInt(requiredVersionStr.minor, 10),
    patch: parseInt(requiredVersionStr.patch, 10),
  }

  return (
    current.major > required.major ||
    (current.major === required.major && current.minor > required.minor) ||
    (current.major === required.major &&
      current.minor === required.minor &&
      current.patch >= required.patch)
  )
}
