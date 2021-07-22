import {RegisteredTokenMetadata} from '../types'

export type TokenRegistryApi = {
  parseTokensMetadata: (toParse: any) => {[subject: string]: RegisteredTokenMetadata}
  getTokensMetadata: (subjects: string[]) => Promise<{[subject: string]: RegisteredTokenMetadata}>
}
