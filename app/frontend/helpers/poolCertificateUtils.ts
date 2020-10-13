import {decode} from 'borc'
import {parseUnsignedTx} from './parser'

export const deserializeCertificate = (file) => {
  if (
    !file ||
    file.type !== 'TxUnsignedShelley'
    // || file.description !== 'Stake Pool Registration Certificate'
  ) {
    throw Error('Specified file is not a cli-format pool registration certificate transaction')
  }

  const unsignedTxDecoded = decode(file.cborHex)
  const parsedTx = parseUnsignedTx(unsignedTxDecoded)

  // if (!parsedTx || !parsedTx.certificates || !parsedTx.certificates.some())

  return parsedTx
}
