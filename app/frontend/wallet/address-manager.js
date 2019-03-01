const range = require('./helpers/range')
const {toBip32StringPath} = require('./helpers/bip32')
const {packAddress} = require('cardano-crypto.js')

const AddressManager = ({
  accountIndex,
  defaultAddressCount,
  gapLimit,
  cryptoProvider,
  disableCaching, // good for tests
  isChange,
  blockchainExplorer,
}) => {
  const deriveAddressMemo = {}
  const derivationScheme = cryptoProvider.getDerivationScheme()

  validateParams()

  function validateParams() {
    if (!gapLimit) {
      throw Error(`Invalid gap limit: ${gapLimit}`)
    }
    if (!defaultAddressCount) {
      throw Error(`Invalid defaultAddressCount: ${defaultAddressCount}`)
    }
  }

  async function discoverAddresses() {
    switch (derivationScheme.type) {
      case 'v1':
        return await discoverAddressesV1()
      case 'v2':
        return await discoverAddressesV2()
      default:
        throw new Error(`Unexpected derivation scheme: ${derivationScheme.type}`)
    }
  }

  function discoverAddressesV1() {
    const childIndexBegin = derivationScheme.startAddressIndex
    const childIndexEnd = childIndexBegin + defaultAddressCount
    return deriveAddressesBlock(childIndexBegin, childIndexEnd)
  }

  async function discoverAddressesV2() {
    let addresses = []
    let childIndexBegin = derivationScheme.startAddressIndex
    let isGapBlock = false

    while (!isGapBlock) {
      const currentAddressBlock = await deriveAddressesBlock(
        childIndexBegin,
        childIndexBegin + gapLimit
      )
      isGapBlock = !(await blockchainExplorer.isSomeAddressUsed(currentAddressBlock))
      addresses =
        isGapBlock && addresses.length > 0 ? addresses : addresses.concat(currentAddressBlock)
      childIndexBegin += gapLimit
    }

    return addresses
  }

  function deriveAddressesBlock(childIndexBegin, childIndexEnd) {
    const absDerivationPaths = range(childIndexBegin, childIndexEnd)
      .map((i) => [accountIndex, isChange ? 1 : 0, i])
      .map(derivationScheme.toAbsoluteDerivationPath)

    return deriveAddresses(absDerivationPaths)
  }

  async function discoverAddressesWithMeta() {
    const addresses = await discoverAddresses()
    const {usedAsInputAddresses, usedAsOutputAddresses} = await getUsedAddresses(addresses)

    return addresses.map((address) => {
      return {
        address,
        bip32StringPath: toBip32StringPath(getAddressToAbsPathMapping()[address]),
        isUsedAsOutput: usedAsOutputAddresses.has(address),
        isUsedAsInput: usedAsInputAddresses.has(address),
      }
    })
  }

  async function getUsedAddresses(addresses) {
    const txHistory = await blockchainExplorer.getTxHistory(addresses)
    const usedAsOutputAddresses = new Set()
    const usedAsInputAddresses = new Set()

    txHistory.forEach((trx) => {
      trx.ctbOutputs.forEach((output) => {
        usedAsOutputAddresses.add(output[0])
      })
      trx.ctbInputs.forEach((input) => {
        usedAsInputAddresses.add(input[0])
      })
    })

    return {
      usedAsInputAddresses,
      usedAsOutputAddresses,
    }
  }

  function deriveAddresses(absDerivationPaths) {
    return Promise.all(absDerivationPaths.map(deriveAddress))
  }

  async function deriveAddress(absDerivationPath) {
    // in derivation scheme 1, the middle part of the derivation path is skipped
    const memoKey = JSON.stringify(absDerivationPath)

    if (!deriveAddressMemo[memoKey] || disableCaching) {
      const xpub = await cryptoProvider.deriveXpub(absDerivationPath)
      const hdPassphrase =
        derivationScheme.type === 'v1' ? await cryptoProvider.getHdPassphrase() : undefined

      deriveAddressMemo[memoKey] = packAddress(
        absDerivationPath,
        xpub,
        hdPassphrase,
        derivationScheme.number
      )
    }

    return deriveAddressMemo[memoKey]
  }

  function getAddressToAbsPathMapping() {
    const result = {}
    Object.keys(deriveAddressMemo).map((key) => {
      result[deriveAddressMemo[key]] = JSON.parse(key)
    })

    return result
  }

  return {
    discoverAddresses,
    discoverAddressesWithMeta,
    getAddressToAbsPathMapping,
    _deriveAddress: deriveAddress,
    _deriveAddresses: deriveAddresses,
  }
}

module.exports = AddressManager
