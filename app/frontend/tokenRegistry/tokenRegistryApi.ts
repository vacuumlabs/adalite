import request from '../wallet/helpers/request'
import {ADALITE_CONFIG} from '../config'
import {RegisteredTokenMetadata} from '../types'
import {TokenRegistryApi} from './types'

export default (): TokenRegistryApi => {
  const fetchTokensMetadata = (subjects: string[]): Promise<any> => {
    const url = `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/tokenRegistry/getTokensMetadata`
    const requestBody = {subjects}
    return request(url, 'POST', JSON.stringify(requestBody), {
      'Content-Type': 'application/json',
    })
  }

  const parseTokensMetadata = (toParse: any): {[subject: string]: RegisteredTokenMetadata} => {
    if (toParse?.Right) {
      return toParse.Right.reduce((acc, tokenMetadata) => {
        const {subject, description, ticker, url, logoHex} = tokenMetadata
        acc[subject] = {subject, description, ticker, url, logoHex}
        acc[tokenMetadata.subject] = {
          subject: tokenMetadata.subject,
          description: tokenMetadata.description.value,
          ticker: tokenMetadata?.ticker?.value,
          url: tokenMetadata?.url?.value,
          logoHex: tokenMetadata?.logo?.value,
          decimals: tokenMetadata?.decimals?.value,
        }
        return acc
      }, {})
    } else {
      return {}
    }
  }

  const getTokensMetadata = async (
    subjects: string[]
  ): Promise<{[subject: string]: RegisteredTokenMetadata}> => {
    const tokensMetadata = await fetchTokensMetadata(subjects)
    return parseTokensMetadata(tokensMetadata)
  }

  return {
    parseTokensMetadata,
    getTokensMetadata,
  }
}
