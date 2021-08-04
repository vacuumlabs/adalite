import {RegisteredTokenMetadata, Token} from '../types'

export type TokenRegistryApi = {
  parseTokensMetadata: (toParse: any) => {[subject: string]: RegisteredTokenMetadata}
  getTokensMetadata: (tokens: Token[]) => Promise<{[subject: string]: RegisteredTokenMetadata}>
}
