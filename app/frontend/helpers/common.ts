import {ADALITE_CONFIG} from '../config'

export const stripNonNumericCharacters = (text: string): string => text.replace(/[^0-9]/gi, '')

export const isVotingRegistrationOpen = () => {
  const now = Date.now()
  return (
    now > ADALITE_CONFIG.ADALITE_NEXT_VOTING_START && now < ADALITE_CONFIG.ADALITE_NEXT_VOTING_END
  )
}
