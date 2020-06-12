const roundNumber = (number: number, decimals = 2) => {
  const tenthPower = Math.pow(10, decimals)
  return Math.round((number + Number.EPSILON) * tenthPower) / tenthPower
}

export default roundNumber
