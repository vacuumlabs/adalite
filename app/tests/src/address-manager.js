const assert = require('assert')

const {HARDENED_THRESHOLD} = require('../../frontend/wallet/constants')
const derivationSchemes = require('../../frontend/wallet/derivation-schemes')
const CardanoWalletSecretCryptoProvider = require('../../frontend/wallet/cardano-wallet-secret-crypto-provider')
const AddressManager = require('../../frontend/wallet/address-manager')
const range = require('../../frontend/wallet/helpers/range')
const mnemonicOrHdNodeStringToWalletSecret = require('../../frontend/wallet/helpers/mnemonicOrHdNodeStringToWalletSecret')
const cryptoProviderSettings = require('./common/crypto-provider-settings')

const cryptoProviders = []
const addressManagers = []

const initAddressManager = async (settings, i) => {
  const parsedWalletSecret = await mnemonicOrHdNodeStringToWalletSecret(settings.secret)

  cryptoProviders[i] = CardanoWalletSecretCryptoProvider(
    {
      derivationScheme: parsedWalletSecret.derivationScheme,
      walletSecret: parsedWalletSecret.walletSecret,
      network: settings.network,
    },
    true
  )

  addressManagers[i] = AddressManager({
    accountIndex: HARDENED_THRESHOLD,
    addressLimit: 10,
    cryptoProvider: cryptoProviders[i],
    derivationScheme: parsedWalletSecret.derivationScheme,
    disableCaching: true,
    isChange: false,
  })
}

before(async () => await Promise.all(cryptoProviderSettings.map(initAddressManager)))

const childIndex2 = 0xf9745151
const childIndex3 = 0x10000323

describe('address generation from secret key', () => {
  const expectedAddress1 = 'Ae2tdPwUPEZLdysXE34s6xRCpqSHvy5mRbrQiegSVQGQFBvkXf5pvseKuzH'
  it("should properly generate root public address (the one used as 'wallet id' in Daedalus)", async () => {
    const derivedAddress1 = await addressManagers[2]._deriveAddress([], 'hardened')
    assert.equal(derivedAddress1, expectedAddress1)

    const derivedAddress2 = await addressManagers[2]._deriveAddress([], 'nonhardened')
    assert.equal(derivedAddress2, expectedAddress1)
  })

  const expectedAddress2 =
    'DdzFFzCqrht5AaL5KGUxfD7sSNiGNmz6DaUmmRAmXApD6yjNy6xLNq1KsXcMAaQipKENnxYLy317KZzSBorB2dEMuQcS5z8AU9akLaMm'
  it('should properly generate some address from hardened key - child index starts with 1 in binary', async () => {
    const derivedAddress2 = await addressManagers[2]._deriveAddress(
      [HARDENED_THRESHOLD, childIndex2],
      'hardened'
    )
    assert.equal(derivedAddress2, expectedAddress2)
  })

  const expectedAddress3 =
    'DdzFFzCqrhsf6sUbywd6FfZHfvmkT7drL7MLzs5KkvfSpTNLExLHhhwmuKdAajnHE3cebNPPkfyUYpoqgEV7ktDLUHF5dV41eWSMh6VU'
  it('should properly generate some address from nonhardened key in hardened mode - child index starts with 0 in binary', async () => {
    const derivedAddress3 = await addressManagers[2]._deriveAddress(
      [HARDENED_THRESHOLD, childIndex3],
      'hardened'
    )
    assert.equal(derivedAddress3, expectedAddress3)
  })

  it('should properly generate some address from nonhardened key in nonhardened mode - child index starts with 0 in binary', async () => {
    const derivedAddress4 = await addressManagers[2]._deriveAddress(
      [HARDENED_THRESHOLD, childIndex3],
      'nonhardened'
    )
    assert.equal(derivedAddress4, expectedAddress3)
  })
})

describe('wallet addresses derivation scheme V1', () => {
  const expectedWalletAddresses = [
    'DdzFFzCqrhsgeBwYfYqJojCSPquZVLVoqAWjoBXsxCE9gJ44881GzVXMverRYLBU5KeArqW3EPThfeucWj1UzBU49c2e87dkdVaVSZ3s',
    'DdzFFzCqrhssuRDi1EGGjCajnyTGqA3HVFownbkTA9M9638Ro3o8CGyZN5NFNQMaHAbhnZgevHqoCwghoq9aScHyoWptamKzwQK7RWFw',
    'DdzFFzCqrhsetWr6ScRnzreftN8nde7Xhf6K3sJqUT8GQPX2bLJNeEz1YhbhyNcewSuymkwPyo21uoAcALJDe8uP44gU9MXnM3EJhVNx',
    'DdzFFzCqrhspskHcFWK16DuGgjVdDSaoWZZCgV8gp256ZufbioHSQCnxSefuAoECZHrFSaF6veHoVxkwSV5eYx6Vi3NGV1qu58NGzS9d',
    'DdzFFzCqrhsoNpMFaQfYFHiuKN5NjNWtypJcKpWsNJX6miADvKxhZxyeDyNkfnBDxswNnGpLCuB6MkNy7uhD4eu4jgMgFkBgySiPegkY',
    'DdzFFzCqrhsun6D8CTjDfzWTZbHaxxvv2RcoAexkBiavN2npSxEciGMprxg8tEu3jMrzZ4enx7Le4eWaiFtoRX6LidsPkcVdF58TTbrr',
    'DdzFFzCqrhsnwP6vhJfe3Zs7aRdFkp6kwiFs9GkGdvT98Bdg6es5ojMe94kcdKVVit7uqtm4bwJwKpgckkH4HwsVQapzACQb4Hqebmfy',
    'DdzFFzCqrht7623beBMy2y21WaAMMngyVEB6nBUG61JXdrh9EZTtN9K5aNQJWjKka8fCxeN46HdLhVJSJw3YQQabm9NVJoH14GMVyT4R',
    'DdzFFzCqrht1CofRyjVZov8G67nHW7cPZwUfLhJehYtMcGB3Zo8CwM2ogYUer5QecKP5xnp4SajKFuXMTYk1SNavrbGVtyoShMMbJdzh',
    'DdzFFzCqrhtDCf6a547LpcwLmpseYwBUhC8vtv274kA1uwvziJ5ZUmi1VVyGrsS7zButfcFTbTqrrV3TyEoE4ZzqjVp7f1Y52NzS4Qfr',
    'DdzFFzCqrhtCupHueaWLLSq65zi6Qqbd5X8j8HEJs8m7vAqw5JMcDgYQNMVB3rzBy9nm6VK4UzbaXkNYSB9VahHPN8Rh17SkQk8qi7rr',
    'DdzFFzCqrht8DEWfNqPZVZg1HK5Jmdqqi6oXfyLSan2sJrAokbSZ7BmXjkD7v4bWYQsuuvTAVQGpH6E3aeJ7pMuRBTV2ypUYLuS23M1h',
    'DdzFFzCqrhsv4YrCT87R1yt7KK6364b5rBzM2TLHJN3Xh7hekm2i8ezTYgVLi6cxUCggCpEvGoKs52MwCgUn6Uxp3uPJ81DuYbUkxV19',
    'DdzFFzCqrhsynmqGHyFcQME9faAJ3PWtwyhfK5wW5vj8hfff46H6KsMSQvFdRUpexGZPgTDrRmvHVfpWZLGjymEPFh4mJnaMyW7k3XRk',
    'DdzFFzCqrhsq9z82fWeapSYt6dFa5gahqe3asqoYtMJhaaaBtT9hbj7m2PrQqQERNjeWuNrSnHXWj2ya2kCQyAkfkNTjPWW3t1Rq9adU',
    'DdzFFzCqrhsqBKENVMB5fXpJMAwLiAsThoL4BQ52QyUbomKATrZz8bLeAxSCWKyw6yYHXD99ASatFiAcfUsD827JiCW3o23dyWCUwEKz',
    'DdzFFzCqrhsnRKoLhvAKjmxKXGd7uP8NkgLiwgAsSAAw8uETJBmsRgFQfTFBtFeZ2EV2fQ5KijX6mp4brdYwXB4QtduHe2z7wTh6UVWw',
    'DdzFFzCqrht59PjE6SYEXztqHAQusqXeEf5V4ARn4VrMCLEYiTveM1Q3UUSkNLjUtszFJcb6zCa8BAiQg6bErE8xqZH7872doULFDWRa',
    'DdzFFzCqrhshEcF1JBBBF73csrRjXKQ9tR86ZyGzT1PJby6ByktW9HjjJpvi4RVo4uU9KY6E1hq4ogsh59aXfrsh4hKbkkTErewZ8n3v',
    'DdzFFzCqrhsmzxyw7miPZpbb8BuftQfmCZF3Lmc3tAQtKp1d8CnWd6BnnrqP6EoDPaD3m63Ri6Jxuduuy8fkPNDTeA2HxfvEnt4rLufU',
  ]

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const derivationPaths = range(HARDENED_THRESHOLD + 1, HARDENED_THRESHOLD + 21)
      .map((i) => [HARDENED_THRESHOLD, 0, i])
      .map(derivationSchemes.v1.toAbsoluteDerivationPath)
    const walletAddresses = await addressManagers[2]._deriveAddresses(derivationPaths)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('wallet addresses derivation scheme V2', () => {
  const expectedWalletAddresses = [
    'Ae2tdPwUPEYzQAvoUDaw3kghu19zJcpZrxY5m2wKz2uQuaCXs8ea9EBAAFQ',
    'Ae2tdPwUPEZHWwSaKPwi4JkDeijLQM93wgbfbmsA7ssGZLQ3Uh1unvABAKR',
    'Ae2tdPwUPEZLeySAx2yxc1eXpdahTqR1fLp8XcVLAHLfHFpukMw7MDt7UyY',
    'Ae2tdPwUPEZDV8rMvDE2hzXT984xEKE332zjiCgFuKAWiiXm7uGpuXoqJ2s',
    'Ae2tdPwUPEZ7uybwGEgjtZ1dDVQAxBsFwaKJkKygzJvoep7kDwfSv3cE9K3',
    'Ae2tdPwUPEZ9gop4Vtwe7x3dAxNcUQbzcvqzimnBuXWQLPFrVrL5okViSaW',
    'Ae2tdPwUPEZ6uA8r8SaVzYyrXWC9bfywpvFFmXebycm8vB5F3SPWh6k66K8',
    'Ae2tdPwUPEZGd4zAPiZycUr4txd1r4ercSyRa9WniDJtgv6BbUmpdf8sGiP',
    'Ae2tdPwUPEZMgMJSVKf9TLPBfLd1hDBABfLtMhB5KamqVLS4VHmgZgJEjp5',
    'Ae2tdPwUPEZ9dqx9Zoo3nMxmzFz4WCz4wWJSxwRG4QmFjZ7oWYSfvGJfc4R',
  ]

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const derivationPaths = range(0, 10)
      .map((i) => [HARDENED_THRESHOLD, 0, i])
      .map(derivationSchemes.v2.toAbsoluteDerivationPath)
    const walletAddresses = await addressManagers[3]._deriveAddresses(derivationPaths)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})
