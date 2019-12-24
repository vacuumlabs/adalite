import * as bech32 from 'bech32'

interface Bech32Info {
  prefix: string
  data: Buffer
}

export const encode = ({prefix, data}: Bech32Info): string => {
  // Note(ppershing): yeah, really, bech32 lib has only api
  const words = bech32.toWords(data)
  // we need longer than default length for privkeys and 1000 should suffice
  return bech32.encode(prefix, words, 1000)
}

export const decode = (str: string): Bech32Info => {
  const tmp = bech32.decode(str, 1000)
  return {
    prefix: tmp.prefix,
    data: new Buffer(bech32.fromWords(tmp.words)),
  }
}

export default {encode, decode}
