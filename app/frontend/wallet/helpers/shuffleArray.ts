const shuffleArray = function shuffleArray<T>(arr: T[], randomGenerator): T[] {
  return arr
    .map((a) => [randomGenerator ? randomGenerator.nextInt() : Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1])
}

export default shuffleArray
