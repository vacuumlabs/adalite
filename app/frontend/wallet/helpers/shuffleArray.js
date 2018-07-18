const shuffleArray = function shuffleArray(arr, randomGenerator) {
  return arr
    .map((a) => [randomGenerator ? randomGenerator.nextInt() : Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1])
}

module.exports = shuffleArray
