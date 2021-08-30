import request from '../wallet/helpers/request'
import {RegisteredTokenMetadata, Token, TokenRegistrySubject} from '../types'
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
  ): Map<TokenRegistrySubject, RegisteredTokenMetadata> => {
    const map = new Map()
    if (toParse?.Right) {
      toParse.Right.forEach((tokenMetadata) =>
        map.set(tokenMetadata.subject, {
          subject: tokenMetadata.subject,
          description: tokenMetadata.description.value,
          ticker: tokenMetadata?.ticker?.value,
          url: tokenMetadata?.url?.value,
          logoBase64: tokenMetadata?.logo?.value,
          decimals: tokenMetadata?.decimals?.value,
        })
      )
    }

    return map
  }

  public readonly getTokensMetadata = async (
    tokens: Token[]
  ): Promise<Map<TokenRegistrySubject, RegisteredTokenMetadata>> => {
    const subjects = tokens.map(({policyId, assetName}) => `${policyId}${assetName}`)
    const tokensMetadata = await this.fetchTokensMetadata(subjects)
    return this.parseTokensMetadata(tokensMetadata)
  }
}

export const createTokenRegistrySubject = (
  policyId: string,
  assetName: string
): TokenRegistrySubject => `${policyId}${assetName}` as TokenRegistrySubject
