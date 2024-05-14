import {Network} from '../types'

import * as bitbox from 'bitbox-api'


let NEWactiveBitBox02: bitbox.PairedBitBox | null = null

type CryptoProviderParams = {
  network: Network
  config: any
}


const XShelleyBitBox02CryptoProvider = async ({
  network,
  config,
}: CryptoProviderParams): Promise<any> => {

  if (NEWactiveBitBox02 !== null) {
    try {
      NEWactiveBitBox02.close()
    } finally {
      NEWactiveBitBox02 = null
    }
  }


  async function withDevice<T>(f: (BitBox02API) => Promise<T>): Promise<any> {
    try {


    } catch (err) {

    }
  }

}

export default XShelleyBitBox02CryptoProvider
