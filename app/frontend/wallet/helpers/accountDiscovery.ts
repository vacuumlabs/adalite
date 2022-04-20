export function* makeBulkAccountIndexIterator() {
  yield [0, 4]
  yield [5, 16]
  for (let i = 17; true; i += 18) {
    yield [i, i + 17]
  }
}
