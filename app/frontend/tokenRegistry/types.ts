import {RegisteredTokenMetadata} from '../types'

export type TokenRegistryApi = {
  getTokensMetadata: (subjects: string[]) => Promise<{[subject: string]: RegisteredTokenMetadata}>
}
