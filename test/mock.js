const fetchMock = require('fetch-mock')
const sinon = require('sinon')

const mock = (CARDANOLITE_CONFIG) => {
  function mockBlockChainExplorer() {
    fetchMock.config.overwriteRoutes = true

    const addressesAndResponses = {
      'DdzFFzCqrhsgeBwYfYqJojCSPquZVLVoqAWjoBXsxCE9gJ44881GzVXMverRYLBU5KeArqW3EPThfeucWj1UzBU49c2e87dkdVaVSZ3s': {
        Right: {
          caAddress:
            'DdzFFzCqrhsgeBwYfYqJojCSPquZVLVoqAWjoBXsxCE9gJ44881GzVXMverRYLBU5KeArqW3EPThfeucWj1UzBU49c2e87dkdVaVSZ3s',
          caType: 'CPubKeyAddress',
          caTxNum: 1,
          caBalance: {getCoin: '1000000'},
          caTxList: [
            {
              ctbId: '14fab8b89cc003da76c147af4ce3619bc36f7064b69f48b7fbad63673753f351',
              ctbTimeIssued: 1520526111,
              ctbInputs: [
                [
                  'DdzFFzCqrhswKekq5Ysev3wL15MndorSfEF82TV5dxHihGjjVweXvmkza4zGnQj3jkvrobwFTnoBpxqes447eVbUDopk3NpLAcQnmfdF',
                  {getCoin: '20000000'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhsjWQpNmu9QWV89P4UDjbha5wAeasKevqTuv7bf2DpNmdXTh5xQJKJftgWWyNQg242YErYXbuM3yagzsGJdpescQPihJJmr',
                  {getCoin: '18829106'},
                ],
                [
                  'DdzFFzCqrhsgeBwYfYqJojCSPquZVLVoqAWjoBXsxCE9gJ44881GzVXMverRYLBU5KeArqW3EPThfeucWj1UzBU49c2e87dkdVaVSZ3s',
                  {getCoin: '1000000'},
                ],
              ],
              ctbInputSum: {getCoin: '20000000'},
              ctbOutputSum: {getCoin: '19829106'},
            },
          ],
        },
      },
      'DdzFFzCqrhspskHcFWK16DuGgjVdDSaoWZZCgV8gp256ZufbioHSQCnxSefuAoECZHrFSaF6veHoVxkwSV5eYx6Vi3NGV1qu58NGzS9d': {
        Right: {
          caAddress:
            'DdzFFzCqrhspskHcFWK16DuGgjVdDSaoWZZCgV8gp256ZufbioHSQCnxSefuAoECZHrFSaF6veHoVxkwSV5eYx6Vi3NGV1qu58NGzS9d',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsoNpMFaQfYFHiuKN5NjNWtypJcKpWsNJX6miADvKxhZxyeDyNkfnBDxswNnGpLCuB6MkNy7uhD4eu4jgMgFkBgySiPegkY': {
        Right: {
          caAddress:
            'DdzFFzCqrhsoNpMFaQfYFHiuKN5NjNWtypJcKpWsNJX6miADvKxhZxyeDyNkfnBDxswNnGpLCuB6MkNy7uhD4eu4jgMgFkBgySiPegkY',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsnwP6vhJfe3Zs7aRdFkp6kwiFs9GkGdvT98Bdg6es5ojMe94kcdKVVit7uqtm4bwJwKpgckkH4HwsVQapzACQb4Hqebmfy': {
        Right: {
          caAddress:
            'DdzFFzCqrhsnwP6vhJfe3Zs7aRdFkp6kwiFs9GkGdvT98Bdg6es5ojMe94kcdKVVit7uqtm4bwJwKpgckkH4HwsVQapzACQb4Hqebmfy',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhssuRDi1EGGjCajnyTGqA3HVFownbkTA9M9638Ro3o8CGyZN5NFNQMaHAbhnZgevHqoCwghoq9aScHyoWptamKzwQK7RWFw': {
        Right: {
          caAddress:
            'DdzFFzCqrhssuRDi1EGGjCajnyTGqA3HVFownbkTA9M9638Ro3o8CGyZN5NFNQMaHAbhnZgevHqoCwghoq9aScHyoWptamKzwQK7RWFw',
          caType: 'CPubKeyAddress',
          caTxNum: 1,
          caBalance: {getCoin: '500000'},
          caTxList: [
            {
              ctbId: '1ce7a1e2606271a7f085262fb7c509c98d60912a943c9be3871ac3ace48ae6d6',
              ctbTimeIssued: 1520526191,
              ctbInputs: [
                [
                  'DdzFFzCqrhsjWQpNmu9QWV89P4UDjbha5wAeasKevqTuv7bf2DpNmdXTh5xQJKJftgWWyNQg242YErYXbuM3yagzsGJdpescQPihJJmr',
                  {getCoin: '18829106'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhszkkEYCCAutkxJkX82CWEsXYqNsVz4mLvL8c87PwbuwUsKM4dcDe7WodJtrsJdv4yRzHMKU2LyBb2yUxtMB1ifqBAYYjKt',
                  {getCoin: '18158212'},
                ],
                [
                  'DdzFFzCqrhssuRDi1EGGjCajnyTGqA3HVFownbkTA9M9638Ro3o8CGyZN5NFNQMaHAbhnZgevHqoCwghoq9aScHyoWptamKzwQK7RWFw',
                  {getCoin: '500000'},
                ],
              ],
              ctbInputSum: {getCoin: '18829106'},
              ctbOutputSum: {getCoin: '18658212'},
            },
          ],
        },
      },
      'DdzFFzCqrhtDCf6a547LpcwLmpseYwBUhC8vtv274kA1uwvziJ5ZUmi1VVyGrsS7zButfcFTbTqrrV3TyEoE4ZzqjVp7f1Y52NzS4Qfr': {
        Right: {
          caAddress:
            'DdzFFzCqrhtDCf6a547LpcwLmpseYwBUhC8vtv274kA1uwvziJ5ZUmi1VVyGrsS7zButfcFTbTqrrV3TyEoE4ZzqjVp7f1Y52NzS4Qfr',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht8DEWfNqPZVZg1HK5Jmdqqi6oXfyLSan2sJrAokbSZ7BmXjkD7v4bWYQsuuvTAVQGpH6E3aeJ7pMuRBTV2ypUYLuS23M1h': {
        Right: {
          caAddress:
            'DdzFFzCqrht8DEWfNqPZVZg1HK5Jmdqqi6oXfyLSan2sJrAokbSZ7BmXjkD7v4bWYQsuuvTAVQGpH6E3aeJ7pMuRBTV2ypUYLuS23M1h',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsetWr6ScRnzreftN8nde7Xhf6K3sJqUT8GQPX2bLJNeEz1YhbhyNcewSuymkwPyo21uoAcALJDe8uP44gU9MXnM3EJhVNx': {
        Right: {
          caAddress:
            'DdzFFzCqrhsetWr6ScRnzreftN8nde7Xhf6K3sJqUT8GQPX2bLJNeEz1YhbhyNcewSuymkwPyo21uoAcALJDe8uP44gU9MXnM3EJhVNx',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsqBKENVMB5fXpJMAwLiAsThoL4BQ52QyUbomKATrZz8bLeAxSCWKyw6yYHXD99ASatFiAcfUsD827JiCW3o23dyWCUwEKz': {
        Right: {
          caAddress:
            'DdzFFzCqrhsqBKENVMB5fXpJMAwLiAsThoL4BQ52QyUbomKATrZz8bLeAxSCWKyw6yYHXD99ASatFiAcfUsD827JiCW3o23dyWCUwEKz',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsv4YrCT87R1yt7KK6364b5rBzM2TLHJN3Xh7hekm2i8ezTYgVLi6cxUCggCpEvGoKs52MwCgUn6Uxp3uPJ81DuYbUkxV19': {
        Right: {
          caAddress:
            'DdzFFzCqrhsv4YrCT87R1yt7KK6364b5rBzM2TLHJN3Xh7hekm2i8ezTYgVLi6cxUCggCpEvGoKs52MwCgUn6Uxp3uPJ81DuYbUkxV19',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsynmqGHyFcQME9faAJ3PWtwyhfK5wW5vj8hfff46H6KsMSQvFdRUpexGZPgTDrRmvHVfpWZLGjymEPFh4mJnaMyW7k3XRk': {
        Right: {
          caAddress:
            'DdzFFzCqrhsynmqGHyFcQME9faAJ3PWtwyhfK5wW5vj8hfff46H6KsMSQvFdRUpexGZPgTDrRmvHVfpWZLGjymEPFh4mJnaMyW7k3XRk',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsmzxyw7miPZpbb8BuftQfmCZF3Lmc3tAQtKp1d8CnWd6BnnrqP6EoDPaD3m63Ri6Jxuduuy8fkPNDTeA2HxfvEnt4rLufU': {
        Right: {
          caAddress:
            'DdzFFzCqrhsmzxyw7miPZpbb8BuftQfmCZF3Lmc3tAQtKp1d8CnWd6BnnrqP6EoDPaD3m63Ri6Jxuduuy8fkPNDTeA2HxfvEnt4rLufU',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht59PjE6SYEXztqHAQusqXeEf5V4ARn4VrMCLEYiTveM1Q3UUSkNLjUtszFJcb6zCa8BAiQg6bErE8xqZH7872doULFDWRa': {
        Right: {
          caAddress:
            'DdzFFzCqrht59PjE6SYEXztqHAQusqXeEf5V4ARn4VrMCLEYiTveM1Q3UUSkNLjUtszFJcb6zCa8BAiQg6bErE8xqZH7872doULFDWRa',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht1CofRyjVZov8G67nHW7cPZwUfLhJehYtMcGB3Zo8CwM2ogYUer5QecKP5xnp4SajKFuXMTYk1SNavrbGVtyoShMMbJdzh': {
        Right: {
          caAddress:
            'DdzFFzCqrht1CofRyjVZov8G67nHW7cPZwUfLhJehYtMcGB3Zo8CwM2ogYUer5QecKP5xnp4SajKFuXMTYk1SNavrbGVtyoShMMbJdzh',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsnRKoLhvAKjmxKXGd7uP8NkgLiwgAsSAAw8uETJBmsRgFQfTFBtFeZ2EV2fQ5KijX6mp4brdYwXB4QtduHe2z7wTh6UVWw': {
        Right: {
          caAddress:
            'DdzFFzCqrhsnRKoLhvAKjmxKXGd7uP8NkgLiwgAsSAAw8uETJBmsRgFQfTFBtFeZ2EV2fQ5KijX6mp4brdYwXB4QtduHe2z7wTh6UVWw',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhtCupHueaWLLSq65zi6Qqbd5X8j8HEJs8m7vAqw5JMcDgYQNMVB3rzBy9nm6VK4UzbaXkNYSB9VahHPN8Rh17SkQk8qi7rr': {
        Right: {
          caAddress:
            'DdzFFzCqrhtCupHueaWLLSq65zi6Qqbd5X8j8HEJs8m7vAqw5JMcDgYQNMVB3rzBy9nm6VK4UzbaXkNYSB9VahHPN8Rh17SkQk8qi7rr',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht7623beBMy2y21WaAMMngyVEB6nBUG61JXdrh9EZTtN9K5aNQJWjKka8fCxeN46HdLhVJSJw3YQQabm9NVJoH14GMVyT4R': {
        Right: {
          caAddress:
            'DdzFFzCqrht7623beBMy2y21WaAMMngyVEB6nBUG61JXdrh9EZTtN9K5aNQJWjKka8fCxeN46HdLhVJSJw3YQQabm9NVJoH14GMVyT4R',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhshEcF1JBBBF73csrRjXKQ9tR86ZyGzT1PJby6ByktW9HjjJpvi4RVo4uU9KY6E1hq4ogsh59aXfrsh4hKbkkTErewZ8n3v': {
        Right: {
          caAddress:
            'DdzFFzCqrhshEcF1JBBBF73csrRjXKQ9tR86ZyGzT1PJby6ByktW9HjjJpvi4RVo4uU9KY6E1hq4ogsh59aXfrsh4hKbkkTErewZ8n3v',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsq9z82fWeapSYt6dFa5gahqe3asqoYtMJhaaaBtT9hbj7m2PrQqQERNjeWuNrSnHXWj2ya2kCQyAkfkNTjPWW3t1Rq9adU': {
        Right: {
          caAddress:
            'DdzFFzCqrhsq9z82fWeapSYt6dFa5gahqe3asqoYtMJhaaaBtT9hbj7m2PrQqQERNjeWuNrSnHXWj2ya2kCQyAkfkNTjPWW3t1Rq9adU',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsun6D8CTjDfzWTZbHaxxvv2RcoAexkBiavN2npSxEciGMprxg8tEu3jMrzZ4enx7Le4eWaiFtoRX6LidsPkcVdF58TTbrr': {
        Right: {
          caAddress:
            'DdzFFzCqrhsun6D8CTjDfzWTZbHaxxvv2RcoAexkBiavN2npSxEciGMprxg8tEu3jMrzZ4enx7Le4eWaiFtoRX6LidsPkcVdF58TTbrr',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht7vBDpRdkoEvoF9aBbEDV1vyQN5JNu33cALADuFSxWgxLTPtG2v39mfc5KkgMU9xLYdvX87t4RxCwo1P2NBeNtEuRnqviw': {
        Right: {
          caAddress:
            'DdzFFzCqrht7vBDpRdkoEvoF9aBbEDV1vyQN5JNu33cALADuFSxWgxLTPtG2v39mfc5KkgMU9xLYdvX87t4RxCwo1P2NBeNtEuRnqviw',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhshzCpfTgKb9A2FAXhL55pxzg3K4txFfTGEMCU1yVBx8SHUbTfB9J4Z95gbGxnU9JN4utDdG2Zd3dWMiUyoiDE7TguZdf7i': {
        Right: {
          caAddress:
            'DdzFFzCqrhshzCpfTgKb9A2FAXhL55pxzg3K4txFfTGEMCU1yVBx8SHUbTfB9J4Z95gbGxnU9JN4utDdG2Zd3dWMiUyoiDE7TguZdf7i',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht9oGpmqe6Q5RiNtpX83nDEwXv8Q4Qx5rRCq7RjY7mEW14LxeLwVNNyWghu1HszBtGxJNktw696xCC71z2HLT5UQXYYBNZ2': {
        Right: {
          caAddress:
            'DdzFFzCqrht9oGpmqe6Q5RiNtpX83nDEwXv8Q4Qx5rRCq7RjY7mEW14LxeLwVNNyWghu1HszBtGxJNktw696xCC71z2HLT5UQXYYBNZ2',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht2oeQBoqiWpSxRt3DZWq4cQWS7F7JoYEsjZwc2xfTa9JGSf1Y7MmayqgQcRC8xi7bpoTMK58W1a6zeNT9YStbeATNp8GeX': {
        Right: {
          caAddress:
            'DdzFFzCqrht2oeQBoqiWpSxRt3DZWq4cQWS7F7JoYEsjZwc2xfTa9JGSf1Y7MmayqgQcRC8xi7bpoTMK58W1a6zeNT9YStbeATNp8GeX',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsmwF529PJmb8iLZ87vV5zgktCHxAKpepo6TbjWR98Z1LNM5CzKZkgyNzn2pmJQRqGSAPK5x79ZAYmAzhoZApArjyhHw21g': {
        Right: {
          caAddress:
            'DdzFFzCqrhsmwF529PJmb8iLZ87vV5zgktCHxAKpepo6TbjWR98Z1LNM5CzKZkgyNzn2pmJQRqGSAPK5x79ZAYmAzhoZApArjyhHw21g',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsp2esip3QoPog4C25Wzip8RhF1FHzsxSGMX97FqPRn7BCTUZJez6Z61oxjjxKdQk8ULUXgEdfcYfMqK2Rpcdu3oVbFt4cP': {
        Right: {
          caAddress:
            'DdzFFzCqrhsp2esip3QoPog4C25Wzip8RhF1FHzsxSGMX97FqPRn7BCTUZJez6Z61oxjjxKdQk8ULUXgEdfcYfMqK2Rpcdu3oVbFt4cP',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhssNCYyKRHgX2Y3qi5E4DtCr3pSiVypqTypT6tFheBWYyKLKkNTXqNPHRYV53nGNAKJo2PHBiE8SJrhwqQYFkHHUwNu8yod': {
        Right: {
          caAddress:
            'DdzFFzCqrhssNCYyKRHgX2Y3qi5E4DtCr3pSiVypqTypT6tFheBWYyKLKkNTXqNPHRYV53nGNAKJo2PHBiE8SJrhwqQYFkHHUwNu8yod',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsiHdniQ3hwLNuvwopzRSsvb6jNtKTbVeVvo9i2WZNf9MVaAs1W69cTgP4UCaMP7ad4WKwWGCEPS5CHUF3RbhB2mpUZ8wYy': {
        Right: {
          caAddress:
            'DdzFFzCqrhsiHdniQ3hwLNuvwopzRSsvb6jNtKTbVeVvo9i2WZNf9MVaAs1W69cTgP4UCaMP7ad4WKwWGCEPS5CHUF3RbhB2mpUZ8wYy',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsw6jJthDnW3uRQ5gj6M6NYTVtHShzPz86K1exCiE1Cgzd5searczsRmykC15nSXZq9WjKtHRayPfqTWyGkqGgcDjtzFrC8': {
        Right: {
          caAddress:
            'DdzFFzCqrhsw6jJthDnW3uRQ5gj6M6NYTVtHShzPz86K1exCiE1Cgzd5searczsRmykC15nSXZq9WjKtHRayPfqTWyGkqGgcDjtzFrC8',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhszprABVfGD7enKjSzomz15ewKR7ut1wDtZQXhUDLANZUjMsJYqQ1u6j1ri6gvYRgNL2JkoMV1bTyG1CoRieFyvaWksvZZp': {
        Right: {
          caAddress:
            'DdzFFzCqrhszprABVfGD7enKjSzomz15ewKR7ut1wDtZQXhUDLANZUjMsJYqQ1u6j1ri6gvYRgNL2JkoMV1bTyG1CoRieFyvaWksvZZp',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhseD1hQD3FwT3jzgf6BHZGjVkT8iUfCX2gnTjyC4KUywtfNx2TA1cVWLfs3HWurU9fQUVz2WURmUhAD8zvcGQb62GCoaqHV': {
        Right: {
          caAddress:
            'DdzFFzCqrhseD1hQD3FwT3jzgf6BHZGjVkT8iUfCX2gnTjyC4KUywtfNx2TA1cVWLfs3HWurU9fQUVz2WURmUhAD8zvcGQb62GCoaqHV',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhstVbtQwqVihhSvhnHoGBhVh82xKDdyHuypN2BCh1kCqjdYNqJYBw2nii2YEPZuY1pwzVKepSiKZqoiy4eTFcpeRTLpaWqT': {
        Right: {
          caAddress:
            'DdzFFzCqrhstVbtQwqVihhSvhnHoGBhVh82xKDdyHuypN2BCh1kCqjdYNqJYBw2nii2YEPZuY1pwzVKepSiKZqoiy4eTFcpeRTLpaWqT',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsxGmNaXoXY4KPLPwuFdDZHenKHf5uZmYxU7MePCQjCqCULvQtLcAfcP5FGj2YX5aPsi2RTKN8muwYJ5enax2RtK2cydjth': {
        Right: {
          caAddress:
            'DdzFFzCqrhsxGmNaXoXY4KPLPwuFdDZHenKHf5uZmYxU7MePCQjCqCULvQtLcAfcP5FGj2YX5aPsi2RTKN8muwYJ5enax2RtK2cydjth',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht5ssBL2LXXAHQAFwJEZ54xT1RGqLrFnz6m62BFcUKMLp63c9EshSwqHLm5YHWqmFiShtWhKeyCUZhEhqu7rTTV7xewXBYw': {
        Right: {
          caAddress:
            'DdzFFzCqrht5ssBL2LXXAHQAFwJEZ54xT1RGqLrFnz6m62BFcUKMLp63c9EshSwqHLm5YHWqmFiShtWhKeyCUZhEhqu7rTTV7xewXBYw',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsgejq4tVbeatmrNT6kKqnsgpMcCbtAVNroRjc2tCU7d1tXBko6kWjmPKYAap9iu8eBDatakXRpvLQ5djdVKxhacbuGM9YJ': {
        Right: {
          caAddress:
            'DdzFFzCqrhsgejq4tVbeatmrNT6kKqnsgpMcCbtAVNroRjc2tCU7d1tXBko6kWjmPKYAap9iu8eBDatakXRpvLQ5djdVKxhacbuGM9YJ',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht8YAoPHDXKniGBQ4kDnWGrHFxcusBJF7SRaYddEvKc3jqWkmkoGkUwTDb6aAmLEGppQFb8yiCKpfvWyBi338iVNA3LSoLm': {
        Right: {
          caAddress:
            'DdzFFzCqrht8YAoPHDXKniGBQ4kDnWGrHFxcusBJF7SRaYddEvKc3jqWkmkoGkUwTDb6aAmLEGppQFb8yiCKpfvWyBi338iVNA3LSoLm',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsrTfrWLj67FdMjkikfU5tnPro9Wj5xNBRRkJ7qJoeW6s7YeYKUorXh6DryPfwUEbaVZXwhYtpQ9QtdnFmdJMPUt5nDB8aQ': {
        Right: {
          caAddress:
            'DdzFFzCqrhsrTfrWLj67FdMjkikfU5tnPro9Wj5xNBRRkJ7qJoeW6s7YeYKUorXh6DryPfwUEbaVZXwhYtpQ9QtdnFmdJMPUt5nDB8aQ',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsiCqrw6sK96bV573hXuAki5R67bhmwVSQhmZgCBY9cSV3bh4UdSbfY3ZfC7ryKj9PD8CXf4JGAFYV5Wc91xA73zFVYS3Vb': {
        Right: {
          caAddress:
            'DdzFFzCqrhsiCqrw6sK96bV573hXuAki5R67bhmwVSQhmZgCBY9cSV3bh4UdSbfY3ZfC7ryKj9PD8CXf4JGAFYV5Wc91xA73zFVYS3Vb',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht3jUCsKsDQR9VEXReKrCVE72tcBJQRoLRp2NeJsy7DwmKsMFtrJ7LXZ5kgA14ASBUUiRKvyHNYQW4EW2LLHcyujeHAk4Yz': {
        Right: {
          caAddress:
            'DdzFFzCqrht3jUCsKsDQR9VEXReKrCVE72tcBJQRoLRp2NeJsy7DwmKsMFtrJ7LXZ5kgA14ASBUUiRKvyHNYQW4EW2LLHcyujeHAk4Yz',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsdyHBTENgndn6yiXLFcu2XjvDTjrPKapJLeay2qpKqnrbyysj4ChFdHmMattnQRQgcmkoy2A3Gca9RfWyVGLpMoCCT3zzz': {
        Right: {
          caAddress:
            'DdzFFzCqrhsdyHBTENgndn6yiXLFcu2XjvDTjrPKapJLeay2qpKqnrbyysj4ChFdHmMattnQRQgcmkoy2A3Gca9RfWyVGLpMoCCT3zzz',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },

      /*
      * begin addresses for 'should properly compute change address for unused wallet'
      */
      'DdzFFzCqrhsef6yEYwhNtfoNQEFAjr2Uur66mBxjnBX6cZyEDLfodWjDxj4K4VDNkAqQjTQVDxrpEptvL85xYLpHP9HUEAPm31tJME3K': {
        Right: {
          caAddress:
            'DdzFFzCqrhsef6yEYwhNtfoNQEFAjr2Uur66mBxjnBX6cZyEDLfodWjDxj4K4VDNkAqQjTQVDxrpEptvL85xYLpHP9HUEAPm31tJME3K',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhszMbrLsiKTm2uwRCz8u5BnXD4ksurL4MzAHXWzVktqse4Pm682UEBm7FssJvyvU1Xg1PhHUmptKFb57yypg8Drd5ieKw8g': {
        Right: {
          caAddress:
            'DdzFFzCqrhszMbrLsiKTm2uwRCz8u5BnXD4ksurL4MzAHXWzVktqse4Pm682UEBm7FssJvyvU1Xg1PhHUmptKFb57yypg8Drd5ieKw8g',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhtCkLJboYQLSsMLgMLqu6QbjdGW9rLUH7nSuLtw4aRDPx5BRvtYNfZUF74sWCLA3sHPy8aGHnT8HfNcENckn8HyagStttxX': {
        Right: {
          caAddress:
            'DdzFFzCqrhtCkLJboYQLSsMLgMLqu6QbjdGW9rLUH7nSuLtw4aRDPx5BRvtYNfZUF74sWCLA3sHPy8aGHnT8HfNcENckn8HyagStttxX',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht7oAQdLpE37pkxrmhz8NnTZCJJoWsNcU9yqkUVbpWBLeZJThhJrymBVvYCqT5SBowcY1YMbADTMq3Et7B8mcqTN7mWBgaW': {
        Right: {
          caAddress:
            'DdzFFzCqrht7oAQdLpE37pkxrmhz8NnTZCJJoWsNcU9yqkUVbpWBLeZJThhJrymBVvYCqT5SBowcY1YMbADTMq3Et7B8mcqTN7mWBgaW',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht1GbdjFpKLMbEb3Vo3V8Ji48WALqpLiXpp33shTrrcft9UdPCsHE555uoaFYXmrcxqEzAnbbc98c8K4x4oqkitvN6GxYVA': {
        Right: {
          caAddress:
            'DdzFFzCqrht1GbdjFpKLMbEb3Vo3V8Ji48WALqpLiXpp33shTrrcft9UdPCsHE555uoaFYXmrcxqEzAnbbc98c8K4x4oqkitvN6GxYVA',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      /*
      * end of addresses for 'should properly compute change address for unused wallet'
      */
      /*
      * address to compute utxo */
      'DdzFFzCqrhshif8KjTpxWKYokS1WBuWAzbpzim9PpVnSZRDQ1KXyUNcomGDU8yYkpQeo2B7HVjFpFcQmfRzyQVRYfW8n1CZocxum6eYn': {
        Right: {
          caAddress:
            'DdzFFzCqrhshif8KjTpxWKYokS1WBuWAzbpzim9PpVnSZRDQ1KXyUNcomGDU8yYkpQeo2B7HVjFpFcQmfRzyQVRYfW8n1CZocxum6eYn',
          caType: 'CPubKeyAddress',
          caTxNum: 5,
          caBalance: {
            getCoin: '150000',
          },
          caTxList: [
            {
              ctbId: 'd9c0cd27c20ec3f5f7eab57488bc762d08026ac7f0b11b196db5fea78cbefccf',
              ctbTimeIssued: 1527078911,
              ctbInputs: [
                [
                  'DdzFFzCqrhseWiQdiVH9fgu9dYXv89J3VQGVEA54sy4G6iBRctMscyGavZ5w2X2PGR7XKTQzK6pJdQwJV7EJYrbGaoUpt75DXuuY2UVQ',
                  {
                    getCoin: '328930',
                  },
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhshif8KjTpxWKYokS1WBuWAzbpzim9PpVnSZRDQ1KXyUNcomGDU8yYkpQeo2B7HVjFpFcQmfRzyQVRYfW8n1CZocxum6eYn',
                  {
                    getCoin: '150000',
                  },
                ],
                [
                  'DdzFFzCqrhsud3uMWVgLMmk82VDNrqGUf3dAqoVnk5rxcaNUnofmHTABnxMVur9AYfMESMLpKuS9frEjhodusgYZyfirpGLHFVki4Bkg',
                  {
                    getCoin: '7860',
                  },
                ],
              ],
              ctbInputSum: {
                getCoin: '328930',
              },
              ctbOutputSum: {
                getCoin: '157860',
              },
            },
            {
              ctbId: '3b1b4ca760d145726ab66ba58805e1d9118e79154439ab8f800f37f382c0e9e4',
              ctbTimeIssued: 1527078911,
              ctbInputs: [
                [
                  'DdzFFzCqrht5MSf39ugHk9d5GoJsWWh5gVHrXZjDf9tqtU45FSj1uZYAzDmAhuZaRLPY7fY9uazozfP7PzaN3Hj9ao3TnoG8uZJMpLui',
                  {
                    getCoin: '1',
                  },
                ],
                [
                  'DdzFFzCqrhshif8KjTpxWKYokS1WBuWAzbpzim9PpVnSZRDQ1KXyUNcomGDU8yYkpQeo2B7HVjFpFcQmfRzyQVRYfW8n1CZocxum6eYn',
                  {
                    getCoin: '500000',
                  },
                ],
                [
                  'DdzFFzCqrhsgjB7fbv6c3f2dADRPVdPYgnVSFEuntJJogQ1TYWxVKYisxfi1FFFYChT5LJTq4nPQ3uSeggr3yX2zeBT21EU6bAK7FC6b',
                  {
                    getCoin: '27529952',
                  },
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrht5MSf39ugHk9d5GoJsWWh5gVHrXZjDf9tqtU45FSj1uZYAzDmAhuZaRLPY7fY9uazozfP7PzaN3Hj9ao3TnoG8uZJMpLui',
                  {
                    getCoin: '1',
                  },
                ],
                [
                  'DdzFFzCqrhskeQvWVgStmvtw82RMMA2JvU7X5JiW3ZWqBuQtXayHTkSGjwefCMuSSHHAse1eVrbjuNHEco3THFpygqoBrCSvygKcaXcq',
                  {
                    getCoin: '27843149',
                  },
                ],
              ],
              ctbInputSum: {
                getCoin: '28029953',
              },
              ctbOutputSum: {
                getCoin: '27843150',
              },
            },
            {
              ctbId: 'abac9493d309462f043ca35da13a49d53d95315e9aba7be79f30599c8aa1bcb4',
              ctbTimeIssued: 1527078831,
              ctbInputs: [
                [
                  'DdzFFzCqrht7ETv16empfkmh6rSgZCxLEXCKqkDf88okyLuFUZhgAEEEh994K216p2A3YCUnaLzz1TPfCyN2qprAoJAefWbZWgfsifZ1',
                  {
                    getCoin: '1000000',
                  },
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhshif8KjTpxWKYokS1WBuWAzbpzim9PpVnSZRDQ1KXyUNcomGDU8yYkpQeo2B7HVjFpFcQmfRzyQVRYfW8n1CZocxum6eYn',
                  {
                    getCoin: '500000',
                  },
                ],
                [
                  'DdzFFzCqrhseWiQdiVH9fgu9dYXv89J3VQGVEA54sy4G6iBRctMscyGavZ5w2X2PGR7XKTQzK6pJdQwJV7EJYrbGaoUpt75DXuuY2UVQ',
                  {
                    getCoin: '328930',
                  },
                ],
              ],
              ctbInputSum: {
                getCoin: '1000000',
              },
              ctbOutputSum: {
                getCoin: '828930',
              },
            },
            {
              ctbId: '7355d49b1ca7d622fd65d1c8a7578aa3ec66ac20bbe5b793c735b318ee24da31',
              ctbTimeIssued: 1527078171,
              ctbInputs: [
                [
                  'DdzFFzCqrht5MSf39ugHk9d5GoJsWWh5gVHrXZjDf9tqtU45FSj1uZYAzDmAhuZaRLPY7fY9uazozfP7PzaN3Hj9ao3TnoG8uZJMpLui',
                  {
                    getCoin: '1',
                  },
                ],
                [
                  'DdzFFzCqrhshif8KjTpxWKYokS1WBuWAzbpzim9PpVnSZRDQ1KXyUNcomGDU8yYkpQeo2B7HVjFpFcQmfRzyQVRYfW8n1CZocxum6eYn',
                  {
                    getCoin: '29313345',
                  },
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrht5MSf39ugHk9d5GoJsWWh5gVHrXZjDf9tqtU45FSj1uZYAzDmAhuZaRLPY7fY9uazozfP7PzaN3Hj9ao3TnoG8uZJMpLui',
                  {
                    getCoin: '1',
                  },
                ],
                [
                  'DdzFFzCqrhtDGaenWDFGrGFMvywXdcEVsmBVZ2jh7orRsLMC6ifThNMGY1PLRSDJKxa8x5WpLBnomPyyQ19xxVeAcqxj2tYtFZ8wGema',
                  {
                    getCoin: '29134496',
                  },
                ],
              ],
              ctbInputSum: {
                getCoin: '29313346',
              },
              ctbOutputSum: {
                getCoin: '29134497',
              },
            },
            {
              ctbId: 'a2c632043324c4cccb9b0db28a0c921d4258a00e9b4fc77f23bb9f98a6567798',
              ctbTimeIssued: 1527078091,
              ctbInputs: [
                [
                  'DdzFFzCqrht5MSf39ugHk9d5GoJsWWh5gVHrXZjDf9tqtU45FSj1uZYAzDmAhuZaRLPY7fY9uazozfP7PzaN3Hj9ao3TnoG8uZJMpLui',
                  {
                    getCoin: '1',
                  },
                ],
                [
                  'DdzFFzCqrht48vksbJHv9JYyt7Bu7UaprNz1pDTruCAbdTUQQSrp5NuQEMKtooZBkT2ph5vB5iTAUPf1y8Je444NcP1Sns8WbsnTAvYq',
                  {
                    getCoin: '29492194',
                  },
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrht5MSf39ugHk9d5GoJsWWh5gVHrXZjDf9tqtU45FSj1uZYAzDmAhuZaRLPY7fY9uazozfP7PzaN3Hj9ao3TnoG8uZJMpLui',
                  {
                    getCoin: '1',
                  },
                ],
                [
                  'DdzFFzCqrhshif8KjTpxWKYokS1WBuWAzbpzim9PpVnSZRDQ1KXyUNcomGDU8yYkpQeo2B7HVjFpFcQmfRzyQVRYfW8n1CZocxum6eYn',
                  {
                    getCoin: '29313345',
                  },
                ],
              ],
              ctbInputSum: {
                getCoin: '29492195',
              },
              ctbOutputSum: {
                getCoin: '29313346',
              },
            },
          ],
        },
      },
      '*': {},
    }
    for (const address in addressesAndResponses) {
      fetchMock.mock({
        matcher: `${
          CARDANOLITE_CONFIG.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL
        }/api/addresses/summary/${address}`,
        response: {
          status: 200,
          body: addressesAndResponses[address],
          sendAsJson: true,
        },
      })
    }
  }

  function mockTransactionSubmitter() {
    fetchMock.config.overwriteRoutes = true

    const requestsAndResponses = {
      '{"txHash":"d9cbe3036b13fb877d0c30ec2d80317ec0833e52216b216b04258b5c35afea96","txBody":"82839f8200d818582482582014fab8b89cc003da76c147af4ce3619bc36f7064b69f48b7fbad63673753f351018200d81858248258201ce7a1e2606271a7f085262fb7c509c98d60912a943c9be3871ac3ace48ae6d601ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581c0878fbeaf6d490d49664c99c9284108e0a58387f31224b8b34428fc9a101581e581c2eab4601bfe5834281489b4f0a202c5a8cf558ba330004952411670a001a9c8c59d91a00142864ffa0828200d8185885825840fa5955500ecacca4939204a8f1af4639747a161cd35a35368c9c8d48df32685b0f48b0997c0e22e87e9533ba19310ba4a9bf0c6cf37bfed513c37de15761d56e584009209ef220b4588cd7b73c436366194ef5cf78091f7fbec4e3f5953a325e34740e0850f6c5efd7ed7a90e5579a431b083b7e79c244ba9b4340d3c73797f89f008200d8185885825840545448ff0dba05dcc4587f522c11b358afe8b974a588364ba074b9017f241b71eac253db1f265e409beeca1858664002572715de9533094eb757525b4f372af558405fdc18f4b49ce8bdb503ea213dea9b8ac1b880cacf08c283b7c8cacef7d1f04154532a5e12f6807608595db9398594855c792e94e34a008bb767ff6f5172060f"}': {
        result: true,
      },
    }
    // eslint-disable-next-line guard-for-in
    for (const request in requestsAndResponses) {
      fetchMock.mock({
        // eslint-disable-next-line no-loop-func
        matcher: (url, opts) => {
          return (
            url === CARDANOLITE_CONFIG.CARDANOLITE_TRANSACTION_SUBMITTER_URL &&
            opts &&
            opts.body === request
          )
        },
        response: Promise.resolve({
          status: 200,
          body: requestsAndResponses[request],
          sendAsJson: true,
        }),
      })
    }

    fetchMock.mock({
      matcher: CARDANOLITE_CONFIG.CARDANOLITE_TRANSACTION_SUBMITTER_URL,
      response: {
        status: 200,
        body: {result: false},
        sendAsJson: true,
      },
    })
  }

  function mockRandomNumberGenerator(value) {
    sinon.stub(Math, 'random').returns(value)
  }

  return {
    mockBlockChainExplorer,
    mockRandomNumberGenerator,
    mockTransactionSubmitter,
  }
}

module.exports = mock
