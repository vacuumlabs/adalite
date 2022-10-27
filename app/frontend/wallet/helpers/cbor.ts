import * as cbor from 'cbor'

export * from 'cbor'

export const encodeCbor = (value: any): Buffer => {
  const enc = new cbor.Encoder({collapseBigIntegers: true})
  enc.pushAny(value)
  return enc.read()
}

export const decodeCbor = cbor.decode
