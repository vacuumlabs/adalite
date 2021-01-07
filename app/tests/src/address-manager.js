import assert from 'assert'

import derivationSchemes from '../../frontend/wallet/helpers/derivation-schemes'
import CardanoWalletSecretCryptoProvider from '../../frontend/wallet/byron/cardano-wallet-secret-crypto-provider'
import AddressManager from '../../frontend/wallet/address-manager'
import mnemonicToWalletSecretDef from '../../frontend/wallet/helpers/mnemonicToWalletSecretDef'
import {
  byronAddressManagerSettings,
  addressManagerSettings,
} from './common/address-manager-settings'
import BlockchainExplorer from '../../frontend/wallet/blockchain-explorer'

import mockNetwork from './common/mock'
import {ByronAddressProvider} from '../../frontend/wallet/byron/byron-address-provider'
import ShelleyJsCryptoProvider from '../../frontend/wallet/shelley/shelley-js-crypto-provider'
import {ShelleyBaseAddressProvider} from '../../frontend/wallet/shelley/shelley-address-provider'

const mockConfig = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_DEFAULT_ADDRESS_COUNT: 10,
  ADALITE_GAP_LIMIT: 10,
}

const blockchainExplorer = BlockchainExplorer(mockConfig, {})

const byronAddressManagers = []
const addressManagers = []

const initAddressManager = async (settings, i) => {
  const {accountIndex, isChange, cryptoSettings, shouldExportPubKeyBulk} = settings

  let walletSecretDef
  if (cryptoSettings.type === 'walletSecretDef') {
    walletSecretDef = {
      rootSecret: Buffer.from(cryptoSettings.secret, 'hex'),
      derivationScheme: derivationSchemes[cryptoSettings.derivationSchemeType],
    }
  } else {
    walletSecretDef = await mnemonicToWalletSecretDef(cryptoSettings.secret)
  }

  const cryptoProvider = ShelleyJsCryptoProvider({
    walletSecretDef,
    network: cryptoSettings.network,
    config: {shouldExportPubKeyBulk},
  })

  const addressProvider = ShelleyBaseAddressProvider(cryptoProvider, accountIndex, isChange)

  addressManagers[i] = AddressManager({
    addressProvider,
    gapLimit: mockConfig.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })
}

const initByronAddressManager = async (settings, i) => {
  const {cryptoSettings, isChange} = settings

  let walletSecretDef
  if (cryptoSettings.type === 'walletSecretDef') {
    walletSecretDef = {
      rootSecret: Buffer.from(cryptoSettings.secret, 'hex'),
      derivationScheme: derivationSchemes[cryptoSettings.derivationSchemeType],
    }
  } else {
    walletSecretDef = await mnemonicToWalletSecretDef(cryptoSettings.secret)
  }

  const cryptoProvider = CardanoWalletSecretCryptoProvider(
    {
      walletSecretDef,
      network: cryptoSettings.network,
    },
    true
  )

  const addressProvider = ByronAddressProvider(cryptoProvider, 0, isChange)

  byronAddressManagers[i] = AddressManager({
    addressProvider,
    gapLimit: mockConfig.ADALITE_GAP_LIMIT,
    blockchainExplorer,
  })
}

before(async () => {
  await Promise.all(byronAddressManagerSettings.map(initByronAddressManager))
  await Promise.all(addressManagerSettings.map(initAddressManager))
})

describe('byron wallet addresses derivation scheme V1', () => {
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
    const walletAddresses = await byronAddressManagers[2]._deriveAddresses(1, 21)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('byron wallet addresses derivation scheme V2', () => {
  const expectedWalletAddresses = [
    'Ae2tdPwUPEZ6RUCnjGHFqi59k5WZLiv3HoCCNGCW8SYc5H9srdTzn1bec4W',
    'Ae2tdPwUPEZ7dnds6ZyhQdmgkrDFFPSDh8jG9RAhswcXt1bRauNw5jczjpV',
    'Ae2tdPwUPEZ8LAVy21zj4BF97iWxKCmPv12W6a18zLX3V7rZDFFVgqUBkKw',
    'Ae2tdPwUPEZ7Ed1V5G9oBoRoK3sbgFU8b9iZY2kegf4s6228EwVLRSq9NzP',
    'Ae2tdPwUPEYyLw6UJRKnbbudG8PJR7KfPhioRW8m1BohkFAqR44pPg6BYVZ',
    'Ae2tdPwUPEYw9wMWUnyutGYXdpVqNStf4g3TAxiAYMyACQAWXNFvs3fZ8do',
    'Ae2tdPwUPEZ9wMYpKKXJLAEa5JV2CKBoiFvKfuqdtDLMARkaZG9P4K7ZRjX',
    'Ae2tdPwUPEZHAZxwzS7MrSS8nc6DXt4Nj8FvrYHXCVDkzVEjrAfVxxZEL4H',
    'Ae2tdPwUPEYz8hGBRWCNJFm2bDuSHBbphMT32wPxALXTVPWrRCtZhSPbRen',
    'Ae2tdPwUPEZHxx6ug6oyXREcwQ1tjBY4D2B6M7rYL9LhbAXfRPfMtm3nV4J',
  ]

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const walletAddresses = await byronAddressManagers[3]._deriveAddresses(0, 10)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
  })
})

describe('byron wallet addresses discovery scheme V2', () => {
  const expectedWalletAddresses = [
    'Ae2tdPwUPEZ6RUCnjGHFqi59k5WZLiv3HoCCNGCW8SYc5H9srdTzn1bec4W',
    'Ae2tdPwUPEZ7dnds6ZyhQdmgkrDFFPSDh8jG9RAhswcXt1bRauNw5jczjpV',
    'Ae2tdPwUPEZ8LAVy21zj4BF97iWxKCmPv12W6a18zLX3V7rZDFFVgqUBkKw',
    'Ae2tdPwUPEZ7Ed1V5G9oBoRoK3sbgFU8b9iZY2kegf4s6228EwVLRSq9NzP',
    'Ae2tdPwUPEYyLw6UJRKnbbudG8PJR7KfPhioRW8m1BohkFAqR44pPg6BYVZ',
    'Ae2tdPwUPEYw9wMWUnyutGYXdpVqNStf4g3TAxiAYMyACQAWXNFvs3fZ8do',
    'Ae2tdPwUPEZ9wMYpKKXJLAEa5JV2CKBoiFvKfuqdtDLMARkaZG9P4K7ZRjX',
    'Ae2tdPwUPEZHAZxwzS7MrSS8nc6DXt4Nj8FvrYHXCVDkzVEjrAfVxxZEL4H',
    'Ae2tdPwUPEYz8hGBRWCNJFm2bDuSHBbphMT32wPxALXTVPWrRCtZhSPbRen',
    'Ae2tdPwUPEZHxx6ug6oyXREcwQ1tjBY4D2B6M7rYL9LhbAXfRPfMtm3nV4J',
    'Ae2tdPwUPEZMPdF4Z6gPy7Yr3NeXcXbBMZv5saB3pmwsp7HWbRobc1VRZ4X',
    'Ae2tdPwUPEZ7F6a36T3Twgha2KDKHNvPSbYGNQNj4Rh5TeNATPffS7NCLkW',
    'Ae2tdPwUPEYvtUpMc6eGLCo92od8m4utcBHTgYvARfUYY51BUowoQRm2hos',
    'Ae2tdPwUPEZNJGBKu6uB7nT4JYXiM7Gexvr9TaEuUFMwC7ns6JeYH6osQrE',
    'Ae2tdPwUPEZDFJ38Ad8PzQaxN4hoqeMfDmP9qvajLDGZSq7Hi26fZJEVnJ8',
    'Ae2tdPwUPEZBSAotfZ47iZ1QtBCDRGEXfftG75di13axqhaviJvWpT48dm6',
    'Ae2tdPwUPEZFg6vSmeiJKxGxwyJjMgbfVfRirMJBMYHJs2sYfQgX4DW85F8',
    'Ae2tdPwUPEZ7zES3hWiT1RSjVoRwteJWTNMzsjNixtrvR6wMHPPTHroAwnJ',
    'Ae2tdPwUPEZFv14bjnVcXgRLA39FUgjw2hFmRxufNGbxwNx2ivBAZHmeaa5',
    'Ae2tdPwUPEZ6ZMHV9PaJbYqPjNNBUPDksRThhZ5qrqHHU4LXgQ7h9XzYAHC',
  ]

  const expectedWalletChangeAddrs = [
    'Ae2tdPwUPEZ2HcLJSwBAujZSsiuWdz57b2KeiJ6FeqgYEh7omJVpUwccDVe',
    'Ae2tdPwUPEZ4thUT2Rjo6DJiZksAQReYEzhxkP3xq5NFxFJchxDbKL5tbag',
    'Ae2tdPwUPEZFkwwYuqW1HMx2RXV9p8dNuNC1Gdw2aZXA8KXPXsDtobEQ14Q',
    'Ae2tdPwUPEZAFUycTo6T73A5F97Ew5D7gN4NL139rpp86HCU4K6th9DKzeH',
    'Ae2tdPwUPEZ58nzeM5vDihSMYpqCcfWTSJc3jgVyTzt7hvPQ58XU4ZLEfYT',
    'Ae2tdPwUPEZ64DHikwFaJMdQNJBce9tvbABG3X9gCeaNzfF68ckKX2n2L4c',
    'Ae2tdPwUPEZLtvX2byRkHWM2kFHJh3HwvsPefnwhmWw9mJfHuXo7FBMuyxg',
    'Ae2tdPwUPEYz66u2V5S35o7pDxzeYfTJ31ekfzFDGECosSg7TBUMGvs8pC3',
    'Ae2tdPwUPEZ8uLjrq8p6aWNpQTwHrV5RDzdtmbZrW72xj3kAqpsZiuvQ1t4',
    'Ae2tdPwUPEZ3EimSircxs5JoJ9BGbvmhtQX9MV7Lq6hQC3ZBNfShPiS2xHm',
  ]

  it('should discover the right sequence of addresses from the root secret key', async () => {
    const mockNet = mockNetwork(mockConfig)
    mockNet.mockBulkAddressSummaryEndpoint()
    const walletAddresses = await byronAddressManagers[3].discoverAddresses()
    const walletChangeAddresses = await byronAddressManagers[4].discoverAddresses()
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedWalletAddresses))
    assert.equal(JSON.stringify(walletChangeAddresses), JSON.stringify(expectedWalletChangeAddrs))
    mockNet.clean()
  })
})

describe('shelley wallet addresses derivation scheme V2', () => {
  it('should derive the right sequence of change addresses from the root secret key', async () => {
    const expectedAddresses = [
      'addr1q9p4n2m7tnrvckjlu5y2y2t73c9g2j7ykwz48dcxhlw6tlg2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsrhcxe0',
      'addr1q86s0h8020kv93f6uqndm6zg9t93nsrjmll4hsea3a55vjq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpstqypk3',
      'addr1q9a3gwe3wyrsxwe83y9f0wj6twmu5dx0y7h8dj2n02qlx5g2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpspvz2as',
      'addr1qylqas4rkk6fshqc9hcktrr7p3u2frrvs5mad6836mes9kq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps8n355h',
      'addr1q9n0gqt43ak8n62tpsy0z43zh0dr6qedv3nkq5zxl79cels2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpse7pksy',
      'addr1qysjvr8gmqvl5np0as883xzqej8v53x2uar7efqvg5maq7g2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps4ra78k',
      'addr1qxljdpsghlel5dyhzye3xe4l828slu3fgfshkj3n5dsnr0q2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpss88jsd',
      'addr1q80t7vczkumzd6d9r5xz2s5ektadas8tjrfxqc3ysuyy0tc2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsc5ydet',
      'addr1q895zcg0ah8qpsx65qjfjd6w94klsht9e0azwlvdzrm2dqg2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps2wwrwq',
      'addr1qxclyzqt7gvvkdr3adyg0as5s8u3k8rm43yu5n5n5gad52q2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsc2vp6p',
      'addr1qx53ku2t54h5xyl02u4yuf7ck7ckvtktwzj886j3zhujgxq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpshjaad5',
      'addr1q9f9dljkktl8g82rjwy308cdkzejcs090ewaa7069v2xgzq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpspqmee3',
      'addr1q8ran6js80kpfutgp34lzdprg9yw0h3lpr5c36dtuxhtqqq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps67z6fm',
      'addr1qyc6rx94e8d4exxdjzq4m6rv78pmn09m5q7euv9yxsqmj3g2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsh2gtsn',
      'addr1q8ffhesgk4zhr4ltr78shumtsddmddaak598fu4anlye6zg2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsc244ca',
      'addr1qy95z8rhl9675srl5v7tcu59ychttthpkc25wj4uc5sqjgc2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsrt6cjx',
      'addr1qy0jcnu8a0ncxpkavsrkp0xagvetcas83ep086xcfz5z6yq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsnqj5tv',
      'addr1q83ajttara8d7fe7yeplfmkskkn509r0hxpvfv2fv5ue0sg2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpswt7xsd',
      'addr1q9ju078yx3j8wmcsyjrgprdvqsy7wpgajgtymc28nxm93ec2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsqttql5',
      'addr1qx7azzc53k6lc77k5x2cl2ph8fhgjncxzl6zcm9jg8tr5jg2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsy2p9y9',
    ]
    const walletAddresses = await addressManagers[0]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })

  it('should derive the right sequence of addresses from the root secret key', async () => {
    const expectedAddresses = [
      'addr1q8eakg39wqlye7lzyfmh900s2luc99zf7x9vs839pn4srjs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjv0zk3',
      'addr1q9vyuwgmpez9nrzyk8k9ctk34pw4lfay2r9a3v4qlhc6yrs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpskh4jl3',
      'addr1qxsl8fks5z02q9jrqluqcq5x54jvwvlg6s84s3nrgrrnzhc2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsu7t87t',
      'addr1qyxmavwva6su3xy8wf3gap3f43vktw38qwdr4edp5f47t7g2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps73h0fk',
      'addr1q83gj5ydpqq9sxx8kg6jxktwlu0vrwfmg5azqfzm5d984zs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps97k8sp',
      'addr1q84vflkn60my500vm8qmka0lgaezl43mlrweh29gdw2temg2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsquk02w',
      'addr1qytaz96l2s6dz07ac5mudnykqh0hm3hqt48yqk06vhrczzc2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsxq206f',
      'addr1q8utasddg033kns4u4d3z0rlth9ylaur3fnukgjf6v5rdqs2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsps5qmn',
      'addr1q9rt7mq9n56rudeagesz64gje6dq7vyr29eeqvkk0xqclnq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps0ng07v',
      'addr1q98x0m4u6vnfmghvhuv6y3qhch7yxeynpdcsyrdcehsjkmc2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsfa05ry',
      'addr1qyqfn05rxpq34lncgxtt9an302glm9697uqazu0ssvxet4s2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps3g6ats',
      'addr1q9hqcp8j8zesn8suyhvjmlesdq8j9y9m5s0y9r9c474dv7g2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsnz3hk0',
      'addr1q8d8k874xz789uadev8uxxdesy0t7cwn23c8wku6w60ts7g2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps0wcm9a',
      'addr1qynq44pfsq9l5cgk9kl5xac90gczgu2kc8nkxt95xvw626g2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpssepj42',
      'addr1q9jh2tdg3hjetcnp0ecsssfw8kytpgz3z3qkafhtc8n9mms2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsxz6ftq',
      'addr1qxgrdcxs4t8a7turztct70wxlxr6t7lt2p72fnkma9epjnq2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps08flyx',
      'addr1qyeydz953rwduwdp0wepemvvjwq3g555lvh25h65c6wq3ss2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsnvhpa6',
      'addr1qx7vxa7sckg29nf3sz80y7mtrsfn4jn8u8nshgu3chz6rps2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpszy75nn',
      'addr1q98wuwmvcm2e608tvnjjawqrewhfh42cyt9hjpdw3d9elsc2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvps5etmj7',
      'addr1qx39zdl4lym6hjmz6yzq5y4jw02jfyvjkwpwve49may288c2s3ps2plp2rc2qcgfmsa8kx2kk7s9s6hfq799tmcwpvpsjrny7r',
    ]
    const walletAddresses = await addressManagers[1]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })

  it('should derive the right sequence of change addresses from Account 1', async () => {
    const expectedAddresses = [
      'addr1qy7sntl48nnrsz2zjwraxh8e732jrzzs0ngqp5k5ujhh6nl4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qsqkd6y',
      'addr1q85xs0g86ygpze3xg3dth3a6xg8c8jgq68qx6lvpehfdefh4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8quha566',
      'addr1qy6v02n7r858z75qre6ztnan89g55gyy0cqepacwh2rptw04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8q6nzvjx',
      'addr1qx3lad69a25s42z5caz2vu2slwvxwsynf3q3lm9twcscqnh4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qfkq6xa',
      'addr1q8rcsk3eel90957s7f79xxlqvdmypn07nkwtdtkp08fckk84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qlwhall',
      'addr1q83atwe9peryqag0p5mxxd07wuum8wnqnhp4jyl36qy530h4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8q5anz47',
      'addr1qx6vkgychkxyu67sllfrexcdwhylvjd5jj86lsyd4p62drl4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qyepsgd',
      'addr1qxcltpwxsckkw8jv8z0pxmtn2ey5pn9uzw8wp5xqr5y907l4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qs99umt',
      'addr1qxf6ymqnr2hmhzq8unsq8nrxn48x9r9w6m3svn4d6uh3c284nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qr3mf0z',
      'addr1q9swhfju307uhhzhgsw6lv2zuhhle42gsxz7fdmfd5hnms84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qnavfqx',
      'addr1q8e2hzh40w2lh545l6yvlarv4jhcv68pw9c4pqksrz694a84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qxcxx42',
      'addr1q8upt2qaclyuzc6se345cmsap7rz6ls0tlumx0u5cthy5k04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qh54fjf',
      'addr1qyvfs5whmsta66p4687qj3r30np2a3da8vrzn4naqh3cla84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qhc3sjx',
      'addr1qxp9zhauy5vajd4xcuzka32tnjurcj0vkr4rk02d445vde04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qvg37hv',
      'addr1q837j24hw9qnsv0fk55yjhlttv5d5f70rjyqqtyvtcgrl084nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qm9wt2l',
      'addr1q803r0rqq6uzettpq0qcqh5c25cndu9d67wad5886akz6v84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8q8xamjd',
      'addr1qyyk6v70jntdv9d8v7ave2rn4y9nwapl6vun3w7lzy9u2qh4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qn3n50q',
      'addr1q9y8rskghzd4pyw46pmjwh4qlhdqqscnffvaw805pjclrd84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qwjrjvj',
      'addr1qxrpy5ljyufg5pkzayjf74jv6etjmefpgzyzyt22gxypd284nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qj06pfp',
      'addr1qytts74ph383kmm6snplk7tz0lgzhk8nldjhxr5vtx3w2nh4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qqav62r',
    ]
    const walletAddresses = await addressManagers[2]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })

  it('should derive the right sequence of addresses from Account 1', async () => {
    const expectedAddresses = [
      'addr1qxgcexwttk64d4tx4jd5zh8aqhdx3mlqkl9mujv50fungkh4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qg8cy6z',
      'addr1qxkz3zqcj05kpqmrj722yl5jndre47sndfewes4gye3aluh4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8q47eyzd',
      'addr1qy2e6qvw6gx6yq2tech003dm9hgcrrn6qr05zd7lruhu9w04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qyjq9t5',
      'addr1qxnuvhygpsxwlr9ntalqzvr5vuqefsz73vek54uf6qk3sph4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qvzx58v',
      'addr1q8tg2uhxmee5kqyu9wnxkkf39gasfy7tw8hwfr5zw2tjk004nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8q3fk6vk',
      'addr1q8n42e4lq889we0m7qkn0zpnpnu3s76tvqq6rlq4hat9hn84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qhd7cn3',
      'addr1qxgz68uwxp7njc76fnfs8xmqrdghm02frtqzn36mt5za0lh4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qrup8jd',
      'addr1qytysuatl0symre0hmp8zvwfzkhdcxmmuavpxj7m4eu02rl4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8q0z4yts',
      'addr1q8zufh3l2dasfd44zl04qsmkrdy622uxz8j8vjwla0w6h7h4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qw3u3ec',
      'addr1qxr2ream9hgh9cr4vgwcu5y7awk09lm3kdsy4ztlyxa8y8l4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qgn3v3v',
      'addr1qy70lyw2vjuq89k8tjmyxzgrlhm0r0w62hfury334wzgkt04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qvvn785',
      'addr1qyal3ttz49wfy7cmf8e70g5vk37y08pqezuvfa9ld99vpx04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qalq7qs',
      'addr1qxqqah75n5gytnm0xzmwe3nnsc3c0erdwxd2wfhe73gm7ch4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qqskwhw',
      'addr1qxjjrhnehxe9j8n5ageqsp7tz6rc3seqlaawadqxc78scj04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qdklf4u',
      'addr1q894mdfd405e4vj2rey3hfymm2mfqwdv7mgv99zymj3r9y84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qq5tz82',
      'addr1q9x8qj0r9dumnfuzav92jf240gsvaww30w39v083ze548l84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qdn8lhj',
      'addr1q97a8lde7azy92vz966w8jusvuwze3yyd96dl9lu7l4dr5h4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qz8ltgd',
      'addr1qynnulmfm0l7rmctz6t9ataz4eh542k9gurh39llnh0tjx04nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8q028wsy',
      'addr1q9hsg6rjwpwj0d8hu9grcs2ta8u79qw6h0ezslzqtrv0s4h4nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qx094f2',
      'addr1q9k6d04pff2mtccuyge6537042md4249u5gl9majlpk2de84nns4m7jjdmrc6qh6dae4yt4aqm8j9v29ccvz7ph5ve8qa6np3t',
    ]
    const walletAddresses = await addressManagers[3]._deriveAddresses(0, 20)
    assert.equal(JSON.stringify(walletAddresses), JSON.stringify(expectedAddresses))
  })
})
