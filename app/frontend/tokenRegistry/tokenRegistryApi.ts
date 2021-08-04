import request from '../wallet/helpers/request'
import {ADALITE_CONFIG} from '../config'
import {RegisteredTokenMetadata, Token} from '../types'
import {TokenRegistryApi} from './types'
import cacheResults from '../helpers/cacheResults'

export default (): TokenRegistryApi => {
  const CACHE_TIMEOUT = 5 * 60 * 1000

  const fetchTokensMetadata = cacheResults(CACHE_TIMEOUT)(
    (subjects: string[]): Promise<any> => {
      const url = `${ADALITE_CONFIG.ADALITE_SERVER_URL}/api/tokenRegistry/getTokensMetadata`
      const requestBody = {subjects}
      return request(url, 'POST', JSON.stringify(requestBody), {
        'Content-Type': 'application/json',
      })
    }
  )

  const parseTokensMetadata = (toParse: any): {[subject: string]: RegisteredTokenMetadata} => {
    if (toParse?.Right) {
      return toParse.Right.reduce((acc, tokenMetadata) => {
        const {subject, description, ticker, url, logoBase64} = tokenMetadata
        acc[subject] = {subject, description, ticker, url, logoBase64}
        acc[tokenMetadata.subject] = {
          subject: tokenMetadata.subject,
          description: tokenMetadata.description.value,
          ticker: tokenMetadata?.ticker?.value,
          url: tokenMetadata?.url?.value,
          logoBase64: tokenMetadata?.logo?.value,
          decimals: tokenMetadata?.decimals?.value,
        }
        return acc
      }, {})
    } else {
      return {}
    }
  }

  const getTokensMetadata = async (
    tokens: Token[]
  ): Promise<{[subject: string]: RegisteredTokenMetadata}> => {
    const subjects = tokens.map(({policyId, assetName}) => `${policyId}${assetName}`)
    const tokensMetadata = await fetchTokensMetadata(subjects)
    return parseTokensMetadata(tokensMetadata)
  }

  return {
    parseTokensMetadata,
    getTokensMetadata,
  }
}
