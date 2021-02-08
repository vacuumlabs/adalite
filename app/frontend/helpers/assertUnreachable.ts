// Required for typescript case exhaustiveness. Remove after strictNullChecks are turned on
function assertUnreachable(x: never): never {
  throw new Error('This should be unreachable.')
}

export default assertUnreachable
