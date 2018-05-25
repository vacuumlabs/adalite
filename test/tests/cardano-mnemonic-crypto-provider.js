const assert = require('assert')

const {HARDENED_THRESHOLD} = require('../../wallet/constants')
const CardanoMnemonicCryptoProvider = require('../../wallet/cardano-mnemonic-crypto-provider')
const {hdNodeToString} = require('./helpers')

const mnemonic = 'cruise bike bar reopen mimic title style fence race solar million clean'
const cryptoProvider1 = CardanoMnemonicCryptoProvider(mnemonic, {})
const cryptoProvider2 = CardanoMnemonicCryptoProvider(
  'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3',
  {}
)

const childIndex1 = 0x80000000
const childIndex2 = 0xf9745151
const childIndex3 = 0x10000323

describe('test signing', () => {
  const message = new Buffer(
    '011a2d964a0958209585b64a94a56074504ad91121333b70b94027580b1e3bd49e18b541e8a4b950',
    'hex'
  )
  const expectedMessageSignature = new Buffer(
    '104aa67d10c5ad01dc958a8ff07b29640cf1005de274d68fb8eb763e7754315248d9c7b7c494acce1887f071f349ff74568fb33125df23aa05d8a3d366a43303',
    'hex'
  )

  it('should produce proper signature', async () => {
    // test signing
    assert.equal(
      Buffer.compare(
        await cryptoProvider1._sign(message, HARDENED_THRESHOLD + 1),
        expectedMessageSignature
      ),
      0
    )
  })
})

describe('test secret key derivation', () => {
  // some hardened secret key - child index starts with 1 in binary
  const expectedHdNodeStr1 =
    'ffd89a6ecc943cd58766294e7575d20f775eba62a93361412d61718026781c00d3d86147df3aa92147ea48f786b2cd2bd7d756d37add3055caa8ba4f1d543198b79060c204436cfb0a660a25a43d3b80bd10a167dacb70e0a9d1ca424c8259e7f0bd12bacfb4f58697cd088f6531130584933aed7dfe53163b7f24f10e6c25da'
  it('should properly derive some hardened secret key - child index starts with 1 in binary', () => {
    const derivedHdNodeStr1 = hdNodeToString(cryptoProvider2._deriveHdNode(childIndex2))
    assert.equal(derivedHdNodeStr1, expectedHdNodeStr1)
  })

  const expectedHdNodeStr2 =
    'e0f31d972365bb76a2dd837c7ba5b4b7c065fa4ad1fbf808ddc17130bf10c40f63772cbaa1cdf7e847543f3cbcb3da7065498c71c04ca1f5cd9dccc18226461efdade44a3c35cfb6ab9c834dbc418da2cba30501139db384f194ef060847d0bd164f072124bcf55af0f01c1b5cd7759a7262b4d205717f4afb282cf98fed3026'
  it('should properly derive some nonhardened secret key - child index starts with 0 in binary', () => {
    const derivedHdNodeStr2 = hdNodeToString(cryptoProvider2._deriveHdNode(childIndex3))
    assert.equal(derivedHdNodeStr2, expectedHdNodeStr2)
  })
})

describe('test address generation from secret key', () => {
  const expectedAddress1 = 'Ae2tdPwUPEZLdysXE34s6xRCpqSHvy5mRbrQiegSVQGQFBvkXf5pvseKuzH'
  it("should properly generate root public address (the one used as 'wallet id' in Daedalus)", async () => {
    const derivedAddress1 = await cryptoProvider2.deriveAddress(childIndex1)
    assert.equal(derivedAddress1, expectedAddress1)
  })

  const expectedAddress2 =
    'DdzFFzCqrht5AaL5KGUxfD7sSNiGNmz6DaUmmRAmXApD6yjNy6xLNq1KsXcMAaQipKENnxYLy317KZzSBorB2dEMuQcS5z8AU9akLaMm'
  it('should properly generate some address from hardened key - child index starts with 1 in binary', async () => {
    const derivedAddress2 = await cryptoProvider2.deriveAddress(childIndex2)
    assert.equal(derivedAddress2, expectedAddress2)
  })

  const expectedAddress3 =
    'DdzFFzCqrhsf6sUbywd6FfZHfvmkT7drL7MLzs5KkvfSpTNLExLHhhwmuKdAajnHE3cebNPPkfyUYpoqgEV7ktDLUHF5dV41eWSMh6VU'
  it('should properly generate some address from nonhardened key - child index starts with 0 in binary', async () => {
    const derivedAddress3 = await cryptoProvider2.deriveAddress(childIndex3)
    assert.equal(derivedAddress3, expectedAddress3)
  })
})

describe('test address ownership verification', () => {
  const ownAddress =
    'DdzFFzCqrhsoStdHaBGfa5ZaLysiTnVuu7SHRcJvvu4yKg94gVBx3TzEV9CjphrFxLhnu1DJUKm2kdcrxYDZBGosrv4Gq3HuiFWRYVdZ'
  it('should accept own address', async () => {
    assert.equal(await cryptoProvider2.isOwnAddress(ownAddress), true)
  })

  const foreignAddress =
    'DdzFFzCqrht1Su7MEaCbFUcKpZnqQp5aUudPjrJZ2h8YADJBDvpsXZk9BducpXcSgujYJGKaTuZye9hb9z3Hff42TXDft5yrsKka6rDW'
  it('should reject foreign address', async () => {
    assert.equal(await cryptoProvider2.isOwnAddress(foreignAddress), false)
  })
})

describe('test wallet addresses derivation', () => {
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
    const walletAddresses = await cryptoProvider2.deriveAddresses(
      HARDENED_THRESHOLD + 1,
      HARDENED_THRESHOLD + 21
    )
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})
