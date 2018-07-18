const fetchMock = require('fetch-mock')

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
      * addresses to compute utxo
      * from mnemonic:
      *  logic easily waste eager injury oval sentence wine bomb embrace gossip supreme
      */
      'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym': {
        Right: {
          caAddress:
            'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: 'aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c',
              ctbTimeIssued: 1528203671,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
                  {getCoin: '3225843'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
                  {getCoin: '2146819'},
                ],
              ],
              ctbInputSum: {getCoin: '3325843'},
              ctbOutputSum: {getCoin: '3146819'},
            },
            {
              ctbId: 'c478c4315055c937ead10230a84efa23f1320dd08e69ecd8450e89887feb2cd3',
              ctbTimeIssued: 1528195291,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
                  {getCoin: '3404867'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
                  {getCoin: '3225843'},
                ],
              ],
              ctbInputSum: {getCoin: '3504867'},
              ctbOutputSum: {getCoin: '3325843'},
            },
          ],
        },
      },
      'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1': {
        Right: {
          caAddress:
            'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: 'b485aa85a1d301d7ee588e724993c23c62496167601f38a2f5d2949675242466',
              ctbTimeIssued: 1527261931,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
                  {getCoin: '23749906'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '2000000'},
                ],
                [
                  'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu',
                  {getCoin: '22570882'},
                ],
              ],
              ctbInputSum: {getCoin: '24749906'},
              ctbOutputSum: {getCoin: '24570882'},
            },
            {
              ctbId: '51f807c6e5b8c154ced682ccc0cdac4d349813b0fba5eb52e03862940bd7ea26',
              ctbTimeIssued: 1527237271,
              ctbInputs: [
                [
                  'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
                  {getCoin: '23928930'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
                  {getCoin: '23749906'},
                ],
              ],
              ctbInputSum: {getCoin: '24928930'},
              ctbOutputSum: {getCoin: '24749906'},
            },
          ],
        },
      },
      'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu': {
        Right: {
          caAddress:
            'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: '88cefdfff46eb7d1d9b7ae9a72b25755096e78cb8be847299eb5f6f1dd1c44cf',
              ctbTimeIssued: 1527262851,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '2000000'},
                ],
                [
                  'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu',
                  {getCoin: '22570882'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '23391858'},
                ],
              ],
              ctbInputSum: {getCoin: '24570882'},
              ctbOutputSum: {getCoin: '24391858'},
            },
            {
              ctbId: 'b485aa85a1d301d7ee588e724993c23c62496167601f38a2f5d2949675242466',
              ctbTimeIssued: 1527261931,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
                  {getCoin: '23749906'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '2000000'},
                ],
                [
                  'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu',
                  {getCoin: '22570882'},
                ],
              ],
              ctbInputSum: {getCoin: '24749906'},
              ctbOutputSum: {getCoin: '24570882'},
            },
          ],
        },
      },
      'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E': {
        Right: {
          caAddress:
            'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
              ctbTimeIssued: 1528209771,
              ctbInputs: [
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
                  {getCoin: '2146819'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
                  {getCoin: '2867795'},
                ],
              ],
              ctbInputSum: {getCoin: '3146819'},
              ctbOutputSum: {getCoin: '2967795'},
            },
            {
              ctbId: 'aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c',
              ctbTimeIssued: 1528203671,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
                  {getCoin: '3225843'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
                  {getCoin: '2146819'},
                ],
              ],
              ctbInputSum: {getCoin: '3325843'},
              ctbOutputSum: {getCoin: '3146819'},
            },
          ],
        },
      },
      'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ': {
        Right: {
          caAddress:
            'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: '51f807c6e5b8c154ced682ccc0cdac4d349813b0fba5eb52e03862940bd7ea26',
              ctbTimeIssued: 1527237271,
              ctbInputs: [
                [
                  'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
                  {getCoin: '23928930'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
                  {getCoin: '23749906'},
                ],
              ],
              ctbInputSum: {getCoin: '24928930'},
              ctbOutputSum: {getCoin: '24749906'},
            },
            {
              ctbId: '9718fd08e6f629f30f644224bb9a815a8194580740038723fbc49fee1b73db46',
              ctbTimeIssued: 1527188171,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '25100000'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
                  {getCoin: '23928930'},
                ],
              ],
              ctbInputSum: {getCoin: '25100000'},
              ctbOutputSum: {getCoin: '24928930'},
            },
          ],
        },
      },
      'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY': {
        Right: {
          caAddress:
            'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: '69d5f1bf80d34dbd9258292e0f786bd5f61f7b04593330028340e602260504df',
              ctbTimeIssued: 1527848811,
              ctbInputs: [
                [
                  'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY',
                  {getCoin: '4212834'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1'},
                ],
                [
                  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
                  {getCoin: '4041939'},
                ],
              ],
              ctbInputSum: {getCoin: '4212834'},
              ctbOutputSum: {getCoin: '4041940'},
            },
            {
              ctbId: 'bc12ed9d26ce3028952626ec69588dec162996777258cdcc639991712f7d1940',
              ctbTimeIssued: 1527263111,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '23391858'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhtCVoiVcCVR8eUJHptcz2APJa7T5dVa85Wd2fdmRra52yK9EyT3yZh53KkYejiBDES8nFthXEsqZnPQPgbruhf6utzeeeQy',
                  {getCoin: '20000000'},
                ],
                [
                  'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY',
                  {getCoin: '4212834'},
                ],
              ],
              ctbInputSum: {getCoin: '24391858'},
              ctbOutputSum: {getCoin: '24212834'},
            },
          ],
        },
      },
      'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5': {
        Right: {
          caAddress:
            'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
          caType: 'CPubKeyAddress',
          caTxNum: 3,
          caBalance: {getCoin: '100000'},
          caTxList: [
            {
              ctbId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
              ctbTimeIssued: 1528209771,
              ctbInputs: [
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
                  {getCoin: '2146819'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
                  {getCoin: '2867795'},
                ],
              ],
              ctbInputSum: {getCoin: '3146819'},
              ctbOutputSum: {getCoin: '2967795'},
            },
            {
              ctbId: 'a9437a6bcba39a352b1e8ec845fc13345b523c56727fe3c9b868f0c13097530f',
              ctbTimeIssued: 1527856111,
              ctbInputs: [
                [
                  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
                  {getCoin: '4041939'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
                  {getCoin: '3770869'},
                ],
              ],
              ctbInputSum: {getCoin: '4041939'},
              ctbOutputSum: {getCoin: '3870869'},
            },
            {
              ctbId: '69d5f1bf80d34dbd9258292e0f786bd5f61f7b04593330028340e602260504df',
              ctbTimeIssued: 1527848811,
              ctbInputs: [
                [
                  'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY',
                  {getCoin: '4212834'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1'},
                ],
                [
                  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
                  {getCoin: '4041939'},
                ],
              ],
              ctbInputSum: {getCoin: '4212834'},
              ctbOutputSum: {getCoin: '4041940'},
            },
          ],
        },
      },
      'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG': {
        Right: {
          caAddress:
            'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: '2aecbf52089b0c2425fa6b8e494003c2be165c741eb76dea72b8c13ec2172b1f',
              ctbTimeIssued: 1527856331,
              ctbInputs: [
                [
                  'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
                  {getCoin: '3770869'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v',
                  {getCoin: '3499799'},
                ],
              ],
              ctbInputSum: {getCoin: '3770869'},
              ctbOutputSum: {getCoin: '3599799'},
            },
            {
              ctbId: 'a9437a6bcba39a352b1e8ec845fc13345b523c56727fe3c9b868f0c13097530f',
              ctbTimeIssued: 1527856111,
              ctbInputs: [
                [
                  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
                  {getCoin: '4041939'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
                  {getCoin: '3770869'},
                ],
              ],
              ctbInputSum: {getCoin: '4041939'},
              ctbOutputSum: {getCoin: '3870869'},
            },
          ],
        },
      },
      'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v': {
        Right: {
          caAddress:
            'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: 'e470b43652fcfbd9d14d7347ddd9f6d14beb5892226d4248819e3e91de9b7d95',
              ctbTimeIssued: 1528116351,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v',
                  {getCoin: '3499799'},
                ],
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '1'},
                ],
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
                  {getCoin: '3404867'},
                ],
              ],
              ctbInputSum: {getCoin: '3699800'},
              ctbOutputSum: {getCoin: '3504867'},
            },
            {
              ctbId: '2aecbf52089b0c2425fa6b8e494003c2be165c741eb76dea72b8c13ec2172b1f',
              ctbTimeIssued: 1527856331,
              ctbInputs: [
                [
                  'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
                  {getCoin: '3770869'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v',
                  {getCoin: '3499799'},
                ],
              ],
              ctbInputSum: {getCoin: '3770869'},
              ctbOutputSum: {getCoin: '3599799'},
            },
          ],
        },
      },
      'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz': {
        Right: {
          caAddress:
            'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
          caType: 'CPubKeyAddress',
          caTxNum: 1,
          caBalance: {getCoin: '2867795'},
          caTxList: [
            {
              ctbId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
              ctbTimeIssued: 1528209771,
              ctbInputs: [
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
                  {getCoin: '2146819'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
                  {getCoin: '2867795'},
                ],
              ],
              ctbInputSum: {getCoin: '3146819'},
              ctbOutputSum: {getCoin: '2967795'},
            },
          ],
        },
      },
      'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D': {
        Right: {
          caAddress:
            'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
          caType: 'CPubKeyAddress',
          caTxNum: 1,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: 'c478c4315055c937ead10230a84efa23f1320dd08e69ecd8450e89887feb2cd3',
              ctbTimeIssued: 1528195291,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
                  {getCoin: '3404867'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
                  {getCoin: '3225843'},
                ],
              ],
              ctbInputSum: {getCoin: '3504867'},
              ctbOutputSum: {getCoin: '3325843'},
            },
          ],
        },
      },
      'DdzFFzCqrht5CupPRNPoukz3K1FD7TvYeSXbbM3oPvmmmLTSsbGzKHHypKNqtSXqVyvpBwqUw3vpRXYhpkbaLKkHw5qUEHr2v7h7Roc7': {
        Right: {
          caAddress:
            'DdzFFzCqrht5CupPRNPoukz3K1FD7TvYeSXbbM3oPvmmmLTSsbGzKHHypKNqtSXqVyvpBwqUw3vpRXYhpkbaLKkHw5qUEHr2v7h7Roc7',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsqi5DBVpJfU4W1EQS8nyNYQk2vVUqj2XMVSuwbaiYmgTrUzjVPAs33fzHXL2zGcmGWTkFPgZ75xUu6hfUjNQGTBgi8myFz': {
        Right: {
          caAddress:
            'DdzFFzCqrhsqi5DBVpJfU4W1EQS8nyNYQk2vVUqj2XMVSuwbaiYmgTrUzjVPAs33fzHXL2zGcmGWTkFPgZ75xUu6hfUjNQGTBgi8myFz',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhssxjikvxsCrKsoefSJgsTC6AAcjpkajpfAaDXxYwHCCkmKEWgV1GiVD4TX6kmSJ1YSLcKhKXuKzMcjGt6Mco3XvnCFhLez': {
        Right: {
          caAddress:
            'DdzFFzCqrhssxjikvxsCrKsoefSJgsTC6AAcjpkajpfAaDXxYwHCCkmKEWgV1GiVD4TX6kmSJ1YSLcKhKXuKzMcjGt6Mco3XvnCFhLez',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht1giHAH8sdhE69QJnXzJV3kDJ2EwQ6aVn7n6evrw4Pq2b5ZnZT9A7iNQPDXjsDpFPywDAqQ9cA7Sd7bxmzuE6ETAm8C3qs': {
        Right: {
          caAddress:
            'DdzFFzCqrht1giHAH8sdhE69QJnXzJV3kDJ2EwQ6aVn7n6evrw4Pq2b5ZnZT9A7iNQPDXjsDpFPywDAqQ9cA7Sd7bxmzuE6ETAm8C3qs',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC': {
        Right: {
          caAddress:
            'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
          caType: 'CPubKeyAddress',
          caTxNum: 2,
          caBalance: {getCoin: '0'},
          caTxList: [
            {
              ctbId: 'aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c',
              ctbTimeIssued: 1528203671,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
                  {getCoin: '3225843'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
                  {getCoin: '1000000'},
                ],
                [
                  'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
                  {getCoin: '2146819'},
                ],
              ],
              ctbInputSum: {getCoin: '3325843'},
              ctbOutputSum: {getCoin: '3146819'},
            },
            {
              ctbId: 'c478c4315055c937ead10230a84efa23f1320dd08e69ecd8450e89887feb2cd3',
              ctbTimeIssued: 1528195291,
              ctbInputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
                  {getCoin: '3404867'},
                ],
              ],
              ctbOutputs: [
                [
                  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
                  {getCoin: '100000'},
                ],
                [
                  'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
                  {getCoin: '3225843'},
                ],
              ],
              ctbInputSum: {getCoin: '3504867'},
              ctbOutputSum: {getCoin: '3325843'},
            },
          ],
        },
      },
      'DdzFFzCqrht4APWANPv7a1RtkQgh62XuKDqzzjjtrAMwpDiSB65YX7GeY8pMPrfkXD16iSS1jD4efYRkogBWnZoH8QHWPwHjFa5HLYLX': {
        Right: {
          caAddress:
            'DdzFFzCqrht4APWANPv7a1RtkQgh62XuKDqzzjjtrAMwpDiSB65YX7GeY8pMPrfkXD16iSS1jD4efYRkogBWnZoH8QHWPwHjFa5HLYLX',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht9QRUpvJ8dpMfY8LRPuwHTtun7rwWT4x2HYzPsx9zPtXDXXBnpL44qEdyfwu3VWKN6jreVJdwSfLbGHzZVQcNNZztXfc2K': {
        Right: {
          caAddress:
            'DdzFFzCqrht9QRUpvJ8dpMfY8LRPuwHTtun7rwWT4x2HYzPsx9zPtXDXXBnpL44qEdyfwu3VWKN6jreVJdwSfLbGHzZVQcNNZztXfc2K',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrht6BoesbT1vqqEZDeoQUcFBm57rZUHtNANPesbnxdYgM8Mch2vk6wPoPfsNxqavKBSxd1eoDhRtbpgx9x8pQdDxHmYVdNoc': {
        Right: {
          caAddress:
            'DdzFFzCqrht6BoesbT1vqqEZDeoQUcFBm57rZUHtNANPesbnxdYgM8Mch2vk6wPoPfsNxqavKBSxd1eoDhRtbpgx9x8pQdDxHmYVdNoc',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsxrarXf9BFZbyc7AFFdxmH4k2hztwaZuoCcZ3wmJaXQQWqRgqoVRjSSUgkkUKGTYvveSbqJ3RBMiyGpNtQh7qUGKQYWi8p': {
        Right: {
          caAddress:
            'DdzFFzCqrhsxrarXf9BFZbyc7AFFdxmH4k2hztwaZuoCcZ3wmJaXQQWqRgqoVRjSSUgkkUKGTYvveSbqJ3RBMiyGpNtQh7qUGKQYWi8p',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhssmYoG5Eca1bKZFdGS8d6iag1mU4wbLeYcSPVvBNF2wRG8yhjzQqErbg63N6KJA4DHqha113tjKDpGEwS5x1dT2KfLSbSJ': {
        Right: {
          caAddress:
            'DdzFFzCqrhssmYoG5Eca1bKZFdGS8d6iag1mU4wbLeYcSPVvBNF2wRG8yhjzQqErbg63N6KJA4DHqha113tjKDpGEwS5x1dT2KfLSbSJ',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
        },
      },
      'DdzFFzCqrhsnx5973UzwoEcQ7cN3THD9ZQZvbVd5srhrPoECSt1WUTrQSR8YicSnH3disaSxQPcNMUEC7XNuFxRd8jCAKVXLne3r29xs': {
        Right: {
          caAddress:
            'DdzFFzCqrhsnx5973UzwoEcQ7cN3THD9ZQZvbVd5srhrPoECSt1WUTrQSR8YicSnH3disaSxQPcNMUEC7XNuFxRd8jCAKVXLne3r29xs',
          caType: 'CPubKeyAddress',
          caTxNum: 0,
          caBalance: {getCoin: '0'},
          caTxList: [],
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
      '{"txHash":"73131c773879e7e634022f8e0175399b7e7814c42684377cf6f8c7a1adb23112","txBody":"82839f8200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765008200d81858248258206ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e276501ff9f8282d818584283581c13f3997560a5b81f5ac680b3322a2339433424e4e589ab3d752afdb6a101581e581c2eab4601bfe583febc23a04fb0abc21557adb47cea49c68d7b2f40a5001ac63884bf182f8282d818584283581cab41e66f954dd7f1c16081755eb02ee61dc720bd9e05790f9de649b7a101581e581c140539c64edded60a7f2d169cb4da86a47bccc6a92e4130754fd0f36001a306ccb8f1a002a8c6cffa0828200d81858858258406830165e81b0666850f36a4583f7a8a29b09e120f99852c56d37ded39bed1bb0464a98c35cf0f6458be6351d8f8527fb8b17fe6be0523e901d9562c2b7a52a9e5840951e97f421d44345f260f5d84070c93a0dbc7dfa883a2cbedb1cedee22cb86b459450d615d580d9a3bd49cf09f2848447287cf306f09115d831276cac42919088200d81858858258400093f68540416f4deea889da21af1f1760edc3478bcac204a3013a046327c29c1748af9d186a7e463caa63ef2c660e5f2a051ad014a050d1b27e636128e1947e5840f44da425f699c39ca539c6e2e2262ed4a4b977dd8bdbb4450d40ab7503dc9b4ebca68a8f819d1f92bfdd2af2825b26bb07ef1f586c1135a88b1cdc8520142208"}': {
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
        response: {
          status: 200,
          body: requestsAndResponses[request],
          sendAsJson: true,
        },
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

  function mockUtxoEndpoint() {
    fetchMock.config.overwriteRoutes = true

    const requestsAndResponses = {
      '["DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5","DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz"]': {
        Right: [
          {
            cuId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
            cuOutIndex: 0,
            cuAddress:
              'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
            cuCoins: {getCoin: '100000'},
          },
          {
            cuId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
            cuOutIndex: 1,
            cuAddress:
              'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
            cuCoins: {getCoin: '2867795'},
          },
        ],
      },
    }
    // eslint-disable-next-line guard-for-in
    for (const request in requestsAndResponses) {
      fetchMock.mock({
        // eslint-disable-next-line no-loop-func
        matcher: (url, opts) => {
          return (
            url ===
              `${CARDANOLITE_CONFIG.CARDANOLITE_BLOCKCHAIN_EXPLORER_URL}/api/bulk/addresses/utxo` &&
            opts &&
            opts.body === request
          )
        },
        response: {
          status: 200,
          body: requestsAndResponses[request],
          sendAsJson: true,
        },
      })
    }
  }

  return {
    mockBlockChainExplorer,
    mockTransactionSubmitter,
    mockUtxoEndpoint,
  }
}

module.exports = mock
