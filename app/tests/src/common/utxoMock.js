const utxoMock = {
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
  '["Ae2tdPwUPEZMPdF4Z6gPy7Yr3NeXcXbBMZv5saB3pmwsp7HWbRobc1VRZ4X","Ae2tdPwUPEZ7DUouRCERfJ8fYHcugjaaZN7GyK8ueH8TtRW8YeP64nDZ1v4","Ae2tdPwUPEZ4thUT2Rjo6DJiZksAQReYEzhxkP3xq5NFxFJchxDbKL5tbag"]': {
    Right: [],
  },

  /*
   From here added for bulk requests optimalization.
   It was necessary because we removed unused address filtering.
   Responses are the same but requests are extended by unused addresses
  */
  '["DdzFFzCqrhsnx5973UzwoEcQ7cN3THD9ZQZvbVd5srhrPoECSt1WUTrQSR8YicSnH3disaSxQPcNMUEC7XNuFxRd8jCAKVXLne3r29xs","DdzFFzCqrhspzoFuJ7CyjGUzikzfWEz6DmjeYpB6Dt7WDUDYi8Wv4qaJ2YNnVsMJi8p8yTPLfaheT9NpEAwig4dL9sFNa3ynkauwWuym","DdzFFzCqrht5WJqSszzTKSH2eLBZRomXaaNdoRvaSbnNq1UD5DesQdtt4zK2s2eJz27XpcZH5bQLvwTKdrMNz1zteB7RnsAeYzZHouMZ","DdzFFzCqrhstDDoCLtf2d6u8PsN8feD7bgY4jUKuGrtpQ3CZdjq3KVEzLTyWFmSx6xpD6z3KVNowPXQvkisHiR6aJTfvAMSFSfXZ9LL1","DdzFFzCqrhsnKPbAXKaqbnEi2vE7d9cfzSMsNZGPofconNp1xugeSQBmBnrnfiHiYh77Cj8Wd1UDy7jz9KuwN8QVdCUCoW9ic4PG7QJu","DdzFFzCqrht2BjaxbFgHEYYHmHNotTdp6p727yGnMccSovXj2ZmR83Q4hYXkong6L7D8aB5Y2fRTZ1zgLJzSzFght3J799UTbeTBJk4E","DdzFFzCqrhsf3ce3SVTJTthAPpfBurHozwfFBGg4Ni8aCP9Pt6DRjZZSbVTYkPZ2kiMeoUHUt2Lwtr9rb54xy6iJNSM35N8Axjo2TTJY","DdzFFzCqrhsjeiN7xW9DpwoPh13BMwDctP9RrufwAMa1dRmFaR9puCyckq4mXkjeZk1VsEJqxkb89z636SsGQ4x54boVoX3DRW3QC9g5","DdzFFzCqrht9xZUzwdRLPTsSUMSXneyBvstDpsFY6xNUhapg4ij2j1Wn5ZKCKYu15zwwMT8nHfzQvdCaywYfMMUNpjGg5MBf4P4KLhkG","DdzFFzCqrhskCAqDmHwoLuK4JpshctGLUc3cVMbCEby6RaJszR5iQczEQuQGowgmzREAccxyuW4MeEKvZ5BGSEtCgfbwv3yCLcy4dU6v","DdzFFzCqrhtCrR5oxyvhmRCfwFJ4tKXo7xocEXGoEMruhp23eddcuZVegJiiyJtuY5NDgG9eoe7CHVDRcszfKTKcHAxccvDVs1xwK7Gz","DdzFFzCqrhsu1demnDXfzT5QEW8bcRRKQAA9KVXmjXDfzrRoogCu23EbAwMvsLqakGZSaT71YAGHYMPNB4w26vog1HTvmSeLXqJvgU7D","DdzFFzCqrht5CupPRNPoukz3K1FD7TvYeSXbbM3oPvmmmLTSsbGzKHHypKNqtSXqVyvpBwqUw3vpRXYhpkbaLKkHw5qUEHr2v7h7Roc7","DdzFFzCqrhsqi5DBVpJfU4W1EQS8nyNYQk2vVUqj2XMVSuwbaiYmgTrUzjVPAs33fzHXL2zGcmGWTkFPgZ75xUu6hfUjNQGTBgi8myFz","DdzFFzCqrhssxjikvxsCrKsoefSJgsTC6AAcjpkajpfAaDXxYwHCCkmKEWgV1GiVD4TX6kmSJ1YSLcKhKXuKzMcjGt6Mco3XvnCFhLez"]': {
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
  '["DdzFFzCqrhsvrNGcR93DW8cmrPVVbP6vFxcL1i92WzvqcHrp1K1of4DQ8t8cr3oQgsMbbY1eXKWhrcpfnTohNqrr6zPdLeE3AYBtxxZZ","DdzFFzCqrhtA8C86FGbYkcnHuu8uNmjZ4M6pDKKYXAwZRYr1Q8mXHmUFhgjcTCkuSDnx8xA7tu75727wAc6Ki5nM2PDFK3JXfdYfbvHC","DdzFFzCqrhsp3YjWh3BHaGTmpi3yCVrcaSoJhiEAkBcT4FsA3rXNC31jDfw8oT1mZ9g3n6nJb4hPzKgCHgT53QpqfGwQHy94gLb7GKsY","DdzFFzCqrhsrndfZ3UoB2eYXwjxFUePiR27BiYfqgPbqzMUiz25sjhxfLjzVhDqT4bsmiypfYKwH66UfFDGsaEffA1HYFw46upt6G7J5","DdzFFzCqrhsr5ysDEKPH1QGFGnUBbSufGWtCfRZ9zLpSU5c7FacKfyJgmNaDHiPZLfjTbwzcvW53ySj89CECGp6FKHCiSnLF6ZJc7Zag"]': {
    Right: [
      {
        cuId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
        cuOutIndex: 0,
        cuAddress:
          'DdzFFzCqrhsvrNGcR93DW8cmrPVVbP6vFxcL1i92WzvqcHrp1K1of4DQ8t8cr3oQgsMbbY1eXKWhrcpfnTohNqrr6zPdLeE3AYBtxxZZ',
        cuCoins: {getCoin: '500000'},
      },
      {
        cuId: '6ca5fde47f4ff7f256a7464dbf0cb9b4fb6bce9049eee1067eed65cf5d6e2765',
        cuOutIndex: 1,
        cuAddress:
          'DdzFFzCqrhtA8C86FGbYkcnHuu8uNmjZ4M6pDKKYXAwZRYr1Q8mXHmUFhgjcTCkuSDnx8xA7tu75727wAc6Ki5nM2PDFK3JXfdYfbvHC',
        cuCoins: {getCoin: '1000000'},
      },
      {
        cuId: 'aa22f977c2671836647d347ebe23822269ce21cd22f231e1279018b569dcd48c',
        cuOutIndex: 0,
        cuAddress:
          'DdzFFzCqrhtA8C86FGbYkcnHuu8uNmjZ4M6pDKKYXAwZRYr1Q8mXHmUFhgjcTCkuSDnx8xA7tu75727wAc6Ki5nM2PDFK3JXfdYfbvHC',
        cuCoins: {getCoin: '6000'},
      },
      {
        cuId: '73131c773879e7e634022f8e0175399b7e7814c42684377cf6f8c7a1adb23112',
        cuOutIndex: 1,
        cuAddress:
          'DdzFFzCqrhtA8C86FGbYkcnHuu8uNmjZ4M6pDKKYXAwZRYr1Q8mXHmUFhgjcTCkuSDnx8xA7tu75727wAc6Ki5nM2PDFK3JXfdYfbvHC',
        cuCoins: {getCoin: '125'},
      },
      {
        cuId: '1ce7a1e2606271a7f085262fb7c509c98d60912a943c9be3871ac3ace48ae6d6',
        cuOutIndex: 1,
        cuAddress:
          'DdzFFzCqrhtA8C86FGbYkcnHuu8uNmjZ4M6pDKKYXAwZRYr1Q8mXHmUFhgjcTCkuSDnx8xA7tu75727wAc6Ki5nM2PDFK3JXfdYfbvHC',
        cuCoins: {getCoin: '5000'},
      },
    ],
  },
}

module.exports = utxoMock
