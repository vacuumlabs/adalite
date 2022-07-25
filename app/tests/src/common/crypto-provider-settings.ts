import {NETWORKS} from '../../../frontend/wallet/constants'

export const cryptoProviderSettings = [
  {
    secret: 'cruise bike bar reopen mimic title style fence race solar million clean',
    network: NETWORKS.MAINNET,
    type: 'mnemonic',
    isShelleyCompatible: false,
  },
  {
    secret: 'logic easily waste eager injury oval sentence wine bomb embrace gossip supreme',
    network: NETWORKS.MAINNET,
    type: 'mnemonic',
    isShelleyCompatible: false,
  },
  {
    secret:
      'A859BCAD5DE4FD8DF3F3BFA24793DBA52785F9A98832300844F028FF2DD75A5FCD24F7E51D3A2A72AC85CC163759B1103EFB1D685308DCC6CD2CCE09F70C948501E949B5B7A72F1AD304F47D842733B3481F2F096CA7DDFE8E1B7C20A1ACAFBB66EE772671D4FEF6418F670E80AD44D1747A89D75A4AD386452AB5DC1ACC32B3',
    network: NETWORKS.MAINNET,
    type: 'walletSecretDef',
    derivationSchemeType: 'v1',
    isShelleyCompatible: false,
  },
  {
    secret:
      'cost dash dress stove morning robust group affair stomach vacant route volume yellow salute laugh',
    network: NETWORKS.MAINNET,
    type: 'mnemonic',
    isShelleyCompatible: false,
  },
  // SHELLEY
  {
    description: '',
    secret:
      'odor match funny accuse spatial copper purse milk quote wine salute three drip weasel fall',
    network: NETWORKS.MAINNET,
    type: 'mnemonic',
    isShelleyCompatible: true,
  },
]

export const shelleyCryptoProviderSettings = {
  mnemonic15Word: {
    description: '',
    secret:
      'odor match funny accuse spatial copper purse milk quote wine salute three drip weasel fall',
    network: NETWORKS.MAINNET,
    type: 'mnemonic',
    isShelleyCompatible: true,
  },
  mnemonic12Word: {
    description: '',
    secret: 'cruise bike bar reopen mimic title style fence race solar million clean',
    network: NETWORKS.MAINNET,
    type: 'mnemonic',
    isShelleyCompatible: false,
  },
  mnemonic15WordUnused: {
    description: '',
    secret:
      'hazard circle fossil diamond oxygen ankle tribe broken must comic duck chef bacon truly dish',
    network: NETWORKS.MAINNET,
    type: 'mnemonic',
    isShelleyCompatible: true,
  },
}
