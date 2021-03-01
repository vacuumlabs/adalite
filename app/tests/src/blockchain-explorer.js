import assert from 'assert'

import BlockchainExplorer from '../../frontend/wallet/blockchain-explorer'
import mockNetwork from './common/mock'

const mockConfig = {
  ADALITE_BLOCKCHAIN_EXPLORER_URL: 'https://explorer.adalite.io',
  ADALITE_SERVER_URL: 'http://localhost:3000',
  ADALITE_DEFAULT_ADDRESS_COUNT: 20,
  ADALITE_GAP_LIMIT: 20,
}

const blockchainExplorer = BlockchainExplorer(mockConfig, {})

const addresses = [
  'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
  'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
  'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu',
  'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
  'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
  'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY',
  'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
  'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
  'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v',
  'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
  'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
  'DdzFFzCqrht5CupPRNPoukz3K1FD7TvYeSXbbM3oPvmmmLTSsbGzKHHypKNqtSXqVyvpBwqUw3vpRXYhpkbaLKkHw5qUEHr2v7h7Roc7',
  'DdzFFzCqrhsqi5DBVpJfU4W1EQS8nyNYQk2vVUqj2XMVSuwbaiYmgTrUzjVPAs33fzHXL2zGcmGWTkFPgZ75xUu6hfUjNQGTBgi8myFz',
  'DdzFFzCqrhssxjikvxsCrKsoefSJgsTC6AAcjpkajpfAaDXxYwHCCkmKEWgV1GiVD4TX6kmSJ1YSLcKhKXuKzMcjGt6Mco3XvnCFhLez',
  'DdzFFzCqrht1giHAH8sdhE69QJnXzJV3kDJ2EwQ6aVn7n6evrw4Pq2b5ZnZT9A7iNQPDXjsDpFPywDAqQ9cA7Sd7bxmzuE6ETAm8C3qs',
  'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
  'DdzFFzCqrht4APWANPv7a1RtkQgh62XuKDqzzjjtrAMwpDiSB65YX7GeY8pMPrfkXD16iSS1jD4efYRkogBWnZoH8QHWPwHjFa5HLYLX',
  'DdzFFzCqrht9QRUpvJ8dpMfY8LRPuwHTtun7rwWT4x2HYzPsx9zPtXDXXBnpL44qEdyfwu3VWKN6jreVJdwSfLbGHzZVQcNNZztXfc2K',
  'DdzFFzCqrht6BoesbT1vqqEZDeoQUcFBm57rZUHtNANPesbnxdYgM8Mch2vk6wPoPfsNxqavKBSxd1eoDhRtbpgx9x8pQdDxHmYVdNoc',
  'DdzFFzCqrhsxrarXf9BFZbyc7AFFdxmH4k2hztwaZuoCcZ3wmJaXQQWqRgqoVRjSSUgkkUKGTYvveSbqJ3RBMiyGpNtQh7qUGKQYWi8p',
]

const expectedTxHistory = [
  {
    ctbId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
    ctbTimeIssued: 1528209771,
    ctbInputs: [
      [
        'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
        {
          getCoin: '2146819',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz',
        {
          getCoin: '2867795',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '3146819',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '2967795',
      getTokens: [],
    },
    effect: 1967795,
    fee: 179024,
    tokenEffects: [],
  },
  {
    ctbId: 'aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c',
    ctbTimeIssued: 1528203671,
    ctbInputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
        {
          getCoin: '3225843',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrht12BRkRZurqmx2g5MA6fyYzabh6dUNg8b4x3ue3ATNzkWix3rf8HgN6KanUX9z6aZkDZjSSe5aGahELSapkFPrPnoTrJmT',
        {
          getCoin: '2146819',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '3325843',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '3146819',
      getTokens: [],
    },
    effect: -2325843,
    fee: 179024,
    tokenEffects: [],
  },
  {
    ctbId: 'c478c4315055c937ead10230a84efa23f1320dd08e69ecd8450e89887feb2cd3',
    ctbTimeIssued: 1528195291,
    ctbInputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
        {
          getCoin: '3404867',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhtCSYYxQ1waRA6ZJHwzVXSNFpq1k3nJSKhRf4Jc4KvAmkJQD4x6TeRMjcNUzSYQGXk9MxStpmax43ZRCDRsgDMwj3zPqizC',
        {
          getCoin: '3225843',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '3504867',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '3325843',
      getTokens: [],
    },
    effect: -179024,
    fee: 179024,
    tokenEffects: [],
  },
  {
    ctbId: 'e470b43652fcfbd9d14d7347ddd9f6d14beb5892226d4248819e3e91de9b7d95',
    ctbTimeIssued: 1528116351,
    ctbInputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v',
        {
          getCoin: '3499799',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '1',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D',
        {
          getCoin: '3404867',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '3699800',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '3504867',
      getTokens: [],
    },
    effect: -194933,
    fee: 194933,
    tokenEffects: [],
  },
  {
    ctbId: '2aecbf52089b0c2425fa6b8e494003c2be165c741eb76dea72b8c13ec2172b1f',
    ctbTimeIssued: 1527856331,
    ctbInputs: [
      [
        'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
        {
          getCoin: '3770869',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v',
        {
          getCoin: '3499799',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '3770869',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '3599799',
      getTokens: [],
    },
    effect: -171070,
    fee: 171070,
    tokenEffects: [],
  },
  {
    ctbId: 'a9437a6bcba39a352b1e8ec845fc13345b523c56727fe3c9b868f0c13097530f',
    ctbTimeIssued: 1527856111,
    ctbInputs: [
      [
        'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
        {
          getCoin: '4041939',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '100000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG',
        {
          getCoin: '3770869',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '4041939',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '3870869',
      getTokens: [],
    },
    effect: -171070,
    fee: 171070,
    tokenEffects: [],
  },
  {
    ctbId: '69d5f1bf80d34dbd9258292e0f786bd5f61f7b04593330028340e602260504df',
    ctbTimeIssued: 1527848811,
    ctbInputs: [
      [
        'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY',
        {
          getCoin: '4212834',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '1',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5',
        {
          getCoin: '4041939',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '4212834',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '4041940',
      getTokens: [],
    },
    effect: -170894,
    fee: 170894,
    tokenEffects: [],
  },
  {
    ctbId: 'bc12ed9d26ce3028952626ec69588dec162996777258cdcc639991712f7d1940',
    ctbTimeIssued: 1527263111,
    ctbInputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
        {
          getCoin: '23391858',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhtCVoiVcCVR8eUJHptcz2APJa7T5dVa85Wd2fdmRra52yK9EyT3yZh53KkYejiBDES8nFthXEsqZnPQPgbruhf6utzeeeQy',
        {
          getCoin: '20000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY',
        {
          getCoin: '4212834',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '24391858',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '24212834',
      getTokens: [],
    },
    effect: -20179024,
    fee: 179024,
    tokenEffects: [],
  },
  {
    ctbId: '88cefdfff46eb7d1d9b7ae9a72b25755096e78cb8be847299eb5f6f1dd1c44cf',
    ctbTimeIssued: 1527262851,
    ctbInputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '2000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu',
        {
          getCoin: '22570882',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E',
        {
          getCoin: '23391858',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '24570882',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '24391858',
      getTokens: [],
    },
    effect: -179024,
    fee: 179024,
    tokenEffects: [],
  },
  {
    ctbId: 'b485aa85a1d301d7ee588e724993c23c62496167601f38a2f5d2949675242466',
    ctbTimeIssued: 1527261931,
    ctbInputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
        {
          getCoin: '23749906',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '2000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu',
        {
          getCoin: '22570882',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '24749906',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '24570882',
      getTokens: [],
    },
    effect: -179024,
    fee: 179024,
    tokenEffects: [],
  },
  {
    ctbId: '51f807c6e5b8c154ced682ccc0cdac4d349813b0fba5eb52e03862940bd7ea26',
    ctbTimeIssued: 1527237271,
    ctbInputs: [
      [
        'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
        {
          getCoin: '23928930',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1',
        {
          getCoin: '23749906',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '24928930',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '24749906',
      getTokens: [],
    },
    effect: -179024,
    fee: 179024,
    tokenEffects: [],
  },
  {
    ctbId: '9718fd08e6f629f30f644224bb9a815a8194580740038723fbc49fee1b73db46',
    ctbTimeIssued: 1527188171,
    ctbInputs: [
      [
        'DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym',
        {
          getCoin: '25100000',
          getTokens: [],
        },
      ],
    ],
    ctbOutputs: [
      [
        'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
        {
          getCoin: '1000000',
          getTokens: [],
        },
      ],
      [
        'DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ',
        {
          getCoin: '23928930',
          getTokens: [],
        },
      ],
    ],
    ctbInputSum: {
      getCoin: '25100000',
      getTokens: [],
    },
    ctbOutputSum: {
      getCoin: '24928930',
      getTokens: [],
    },
    tokenEffects: [],
    effect: -171070,
    fee: 171070,
  },
]

// eslint-disable-next-line prefer-arrow-callback
describe.skip('wallet history parsing', function() {
  this.timeout(10000)

  it('should properly fetch wallet history', async () => {
    const mockNet = mockNetwork(mockConfig)
    mockNet.mockBulkAddressSummaryEndpoint()
    const txHistory = await blockchainExplorer.getTxHistory(addresses)

    assert.deepEqual(txHistory, expectedTxHistory)
    mockNet.clean()
  })
})

// eslint-disable-next-line prefer-arrow-callback
describe('wallet unspent outputs fetching', function() {
  this.timeout(10000)

  it('should properly fetch unspent transaction outputs for addresses', async () => {
    const mockNet = mockNetwork(mockConfig)
    mockNet.mockUtxoEndpoint()
    const utxos = await blockchainExplorer.fetchUnspentTxOutputs([addresses[6], addresses[9]])
    const utxoSum = utxos.reduce((acc, cur) => acc + cur.coins, 0)

    assert.equal(utxoSum, 2967795)
    mockNet.clean()
  })
})
