/**
 * Returns an array with arrays of the given size.
 *
 * @param array {Array} Array to split
 * @param size {Integer} Size of every group
 */
const chunk = (array, size) => {
  const results = []
  const mutableArray = [...array] // splice modifies array, we want to prevent mutating input array

  while (mutableArray.length) {
    results.push(mutableArray.splice(0, size))
  }

  return results
}

module.exports = chunk
