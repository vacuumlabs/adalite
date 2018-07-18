/*
* Source: https://stackoverflow.com/questions/424292/seedable-javascript-random-number-generator
*/

function PseudoRandom(seed) {
  // LCG using GCC's constants
  const m = 0x80000000 // 2**31;
  const a = 1103515245
  const c = 12345

  let state = seed || Math.floor(Math.random() * (this.m - 1))

  function nextInt() {
    state = (a * state + c) % m
    return state
  }

  function nextFloat() {
    // returns in range [0,1]
    return nextInt() / (m - 1)
  }

  return {
    nextInt,
    nextFloat,
  }
}

module.exports = PseudoRandom
