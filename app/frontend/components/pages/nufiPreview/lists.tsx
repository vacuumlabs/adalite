import {WebIcon, ExtensionIcon, ListItemIcon} from './icons'
import {Fragment, h} from 'preact'
import {NufiCard, NufiList} from './utils'

export const partners = [
  {
    label: 'Ledger',
    path: 'assets/nufiPreviewPage/partners/Ledger.svg',
  },
  {
    label: 'Trezor',
    path: 'assets/nufiPreviewPage/partners/Trezor.svg',
  },
  {
    label: 'Solana',
    path: 'assets/nufiPreviewPage/partners/Solana.svg',
  },
  {
    label: 'Cardano',
    path: 'assets/nufiPreviewPage/partners/Cardano.svg',
  },
  {
    label: 'flow',
    path: 'assets/nufiPreviewPage/partners/flow.svg',
  },
  {
    label: 'AdaLite',
    path: 'assets/nufiPreviewPage/partners/AdaLite.svg',
  },
  {
    label: 'Vacuumlabs',
    path: 'assets/nufiPreviewPage/partners/Vacuumlabs.svg',
  },
]

export const heroTickList = [
  'Connect to Cardano dApps to buy and sell NFTs, trade tokens, and discover DeFi',
  'In-app NFT gallery, staking dashboard, and more',
]

export const nufiComparisonContent = [
  {
    label: 'Non-custodial storage and staking',
    adalite: true,
    nufi: true,
  },
  {
    label: 'Ledger and Trezor compatible',
    adalite: true,
    nufi: true,
  },
  {
    label:
      'Browser extension + dApp connector to connect to NFT marketplaces, DEXes, DeFi and more',
    adalite: false,
    nufi: true,
  },
  {
    label: 'Visual NFT gallery',
    adalite: false,
    nufi: true,
  },
  {
    label: 'Integrated Cardano DEX',
    adalite: false,
    nufi: true,
  },
  {
    label: 'Send multiple assets in 1 transaction',
    adalite: false,
    nufi: true,
  },
  {
    label: 'See fiat values of Cardano tokens in 25+ currencies',
    adalite: false,
    nufi: true,
  },
  {
    label: 'Hide accounts you no longer use',
    adalite: false,
    nufi: true,
  },
  {
    label: 'Multiple blockchains supported',
    adalite: false,
    nufi: true,
  },
  {
    label: 'Buy/sell crypto with card or bank transfer',
    adalite: false,
    nufi: true,
  },
  {
    label: 'In-app cross-chain trading',
    adalite: false,
    nufi: true,
  },
] as const

const howToUseNufiLinks = [
  {
    label: (
      <Fragment>
        Install Browser extension <br /> + dApp Connector
      </Fragment>
    ),
    additionalText:
      '(Recommended. Select this option to connect to dApps to buy/sell NFTs, trade tokens, discover DeFi and more)',
    Icon: ExtensionIcon,
    href: 'https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca',
  },
  {
    label: 'Open Web Wallet',
    additionalText: '(Compatible with all browsers. No dApp connector)',
    Icon: WebIcon,
    href: 'https://wallet.nu.fi?utm_source=adalite&utm_medium=previewPage',
  },
]
const afterImporting = {
  title: 'After you import your wallet into NuFi:',
  list: [
    'You’ll see the same accounts and assets you see on AdaLite',
    'Your staking setup and rewards will be the same with no further action needed',
    'Your wallet’s receiving address will be the same',
    'You’ll use a password to log in instead of entering your seed phrase or connecting a device',
  ],
}

export const importSection = [
  {
    title: 'Choose how you’d like to use NuFi:',
    content: howToUseNufiLinks.map(({href, label, additionalText, Icon}) => (
      <div style={{width: '85%'}} key={href}>
        <NufiCard
          href={href}
          text={
            <Fragment>
              {label} <br />
            </Fragment>
          }
          icon={<Icon />}
        />
        <p style={{paddingTop: 5}}>{additionalText}</p>
        <br />
      </div>
    )),
  },
  {
    title: 'Import your AdaLite wallet:',
    content: (
      <Fragment>
        <div>
          For mnemonic/seed phrase wallets:
          <br />
          Click 'Restore Wallet' and enter your 15 or 24-word seed phrase.
        </div>
        <br />
        <div>
          For Ledger/Trezor hardware wallets:
          <br />
          Click 'Pair Hardware Wallet' and follow onscreen instructions.
        </div>
        <br />
      </Fragment>
    ),
  },
  {
    title: afterImporting.title,
    content: <NufiList list={afterImporting.list} icon={<ListItemIcon />} />,
  },
]
