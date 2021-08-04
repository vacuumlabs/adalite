import request from '../wallet/helpers/request'
import {RegisteredTokenMetadata, Token} from '../types'
import cacheResults from '../helpers/cacheResults'

export class TokenRegistry {
  private readonly url: string
  private readonly fetchTokensMetadata: (subjects: string[]) => Promise<any>

  constructor(url: string, cacheTimeout?: number) {
    this.url = url
    this.fetchTokensMetadata = cacheTimeout
      ? cacheResults(cacheTimeout)(this._fetchTokensMetadata)
      : this._fetchTokensMetadata
  }

  private readonly _fetchTokensMetadata = (subjects: string[]): Promise<any> => {
    const requestBody = {subjects}
    return request(this.url, 'POST', JSON.stringify(requestBody), {
      'Content-Type': 'application/json',
    })
  }

  public readonly parseTokensMetadata = (
    toParse: any
  ): {[subject: string]: RegisteredTokenMetadata} => {
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

  public readonly getTokensMetadata = async (
    tokens: Token[]
  ): Promise<{[subject: string]: RegisteredTokenMetadata}> => {
    const subjects = tokens.map(({policyId, assetName}) => `${policyId}${assetName}`)
    const tokensMetadata = await this.fetchTokensMetadata(subjects)
    return this.parseTokensMetadata(tokensMetadata)
  }
}
