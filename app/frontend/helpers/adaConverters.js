const toCoins = (value) => value * 1000000
const toAda = (value) => value * 0.000001
const roundWholeAdas = (value) => toCoins(Math.round(toAda(value)))

module.exports = {
  toCoins,
  toAda,
  roundWholeAdas,
}
