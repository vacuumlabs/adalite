import {Lovelace, Ada} from '../state'

const toCoins = (value: Ada): Lovelace => (value * 1000000) as Lovelace
const toAda = (value: Lovelace): Ada => (value * 0.000001) as Ada
const roundWholeAdas = (value: Lovelace): Lovelace => toCoins(Math.round(toAda(value)) as Ada)

export {toCoins, toAda, roundWholeAdas}
