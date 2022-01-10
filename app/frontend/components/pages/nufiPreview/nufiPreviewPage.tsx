import {h, JSX, Fragment} from 'preact'

const nufiWalletContent = {
  title: 'It’s fast and easy to access your current wallet through NuFi (AdaLite 2.0)!',
  list: [
    'Cardano visual NFT gallery with bulk sending functionality.',
    '1st In-App integrated Cardano DEX.',
    'Multi-Account & Multi-Delegation from a single wallet.',
    'In-App pool search and node staking.',
    'Supports additional blockchain Solana (SOL), with FLOW integration coming soon!',
  ],
}

const nufiComparisonContent = [
  {
    comparison: {
      label: 'Non-custodial staking and secure storage',
    },
    adalite: true,
    nufi: true,
  },
  {
    comparison: {
      label: 'Ledger and Trezor support',
    },
    adalite: true,
    nufi: true,
  },
  {
    comparison: {
      label: '‘Read-only’ mode',
      tooltip: 'to view your HW wallets account balances without connecting your device',
    },
    adalite: false,
    nufi: true,
  },
  {
    comparison: {
      label: 'In-app NFT gallery',
      tooltip: 'to visually manage and bulk send Cardano NFTs',
    },
    adalite: false,
    nufi: true,
  },
  {
    comparison: {
      label: 'Integrated Cardano DEX',
      tooltip: 'for quick and easy token swaps',
    },
    adalite: false,
    nufi: true,
  },
  {
    comparison: {
      label: 'Multi-blockchain',
      tooltip: 'staking and asset management',
    },
    adalite: false,
    nufi: '10+ PoS blockchains supported by Q4 ‘22',
  },
  {
    comparison: {
      label: 'In-app crypto purchases',
      tooltip: 'using credit card/bank transfer',
    },
    adalite: false,
    nufi: 'Coming Q1 ‘22',
  },
  {
    comparison: {
      label: 'Own community token',
    },
    adalite: false,
    nufi: 'Coming Q2 ‘22',
  },
  {
    comparison: {
      label: 'Discord community',
    },
    adalite: false,
    nufi: true,
  },
] as const

type NufiListProps = {
  title: string
  list: string[]
}

const NufiList = ({title, list}: NufiListProps) => {
  return (
    <div className="list-spacing">
      <h2 className="list-heading">{title}</h2>
      <ul className="nufi-preview-content">
        {list.map((item, index) => (
          <li key={index} className="list-item">
            <span className="list-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" fill="#292929" />
                <path
                  d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"
                  fill="#757575"
                />
              </svg>
            </span>
            <span className="">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type NudiCardProps = {
  text: string
  icon: JSX.Element
  href: string
}

const NufiCard = ({icon, text, href}: NudiCardProps) => {
  return (
    <a href={href} className="nufi-card">
      <div className="nufi-card-left">
        <div className="nufi-card-icon-wrapper">{icon}</div>
      </div>
      <div className="MuiBox-root MuiBox-root-44">
        <p className="MuiTypography-root MuiTypography-body2">{text}</p>
      </div>
    </a>
  )
}

const CreateIcon = () => {
  return (
    <svg className="nufi-card-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}
const ImportIcon = () => {
  return (
    <svg className="nufi-card-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
    </svg>
  )
}
const CloseIcon = () => {
  return (
    <svg
      className="nufi-card-icon nufi-card-icon-red"
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

const CheckIcon = () => {
  return (
    <svg className="nufi-card-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  )
}

const ComparisonLabel = ({label, tooltip}: {label: string; tooltip?: string}) => {
  return (
    <div className="nufi-comparison-label-container">
      <p>{label}</p>
      {tooltip && (
        <span className="nufi-comparison-tooltip" aria-label={tooltip}>
          <svg viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
            <g fill="currentColor" fillRule="evenodd">
              <path d="M13.5 27C20.956 27 27 20.956 27 13.5S20.956 0 13.5 0 0 6.044 0 13.5 6.044 27 13.5 27zm0-2C7.15 25 2 19.85 2 13.5S7.15 2 13.5 2 25 7.15 25 13.5 19.85 25 13.5 25z" />
              <path d="M12.05 7.64c0-.228.04-.423.12-.585.077-.163.185-.295.32-.397.138-.102.298-.177.48-.227.184-.048.383-.073.598-.073.203 0 .398.025.584.074.186.05.35.126.488.228.14.102.252.234.336.397.084.162.127.357.127.584 0 .22-.043.412-.127.574-.084.163-.196.297-.336.4-.14.106-.302.185-.488.237-.186.053-.38.08-.584.08-.215 0-.414-.027-.597-.08-.182-.05-.342-.13-.48-.235-.135-.104-.243-.238-.32-.4-.08-.163-.12-.355-.12-.576zm-1.02 11.517c.134 0 .275-.013.424-.04.148-.025.284-.08.41-.16.124-.082.23-.198.313-.35.085-.15.127-.354.127-.61v-5.423c0-.238-.042-.43-.127-.57-.084-.144-.19-.254-.318-.332-.13-.08-.267-.13-.415-.153-.148-.024-.286-.036-.414-.036h-.21v-.95h4.195v7.463c0 .256.043.46.127.61.084.152.19.268.314.35.125.08.263.135.414.16.15.027.29.04.418.04h.21v.95H10.82v-.95h.21z" />
            </g>
          </svg>
        </span>
      )}
    </div>
  )
}

type ComparisonRowProps = {
  heading?: boolean
  firstItem?: JSX.Element
  secondItem?: JSX.Element
  thirdItem: JSX.Element
}

const YoutubeEmbed = ({embedId}) => (
  <div className="nufi-video-container">
    <iframe
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allowFullScreen
      title="Embedded youtube"
      className="nufi-responsive-iframe"
    />
  </div>
)

const ComparisonRow = ({firstItem, secondItem, thirdItem, heading = false}: ComparisonRowProps) => {
  return (
    <div className="nufi-comparison-row">
      {firstItem && (
        <div className={`nufi-comparison-row-${heading ? 'heading-highlighted' : 'highlighted'}`}>
          {firstItem}
        </div>
      )}
      {secondItem && (
        <div className={`nufi-comparison-row-${heading ? 'heading-regular' : 'regular'}`}>
          {secondItem}
        </div>
      )}
      <div className={`nufi-comparison-row-${heading ? 'heading-regular' : 'regular'} last`}>
        {thirdItem}
      </div>
    </div>
  )
}

const NufiPreviewPage = () => {
  const chooseIcon = (state: boolean | string) =>
    state ? (
      <Fragment>
        {' '}
        <CheckIcon />
        {typeof state === 'string' && <p className="nufi-comparison-row-caption">{state}</p>}
      </Fragment>
    ) : (
      <CloseIcon />
    )

  return (
    <div className="nufi-preview-page">
      <div
        className="nufi-preview-banner"
        style={{background: "url('../assets/nufiBanner.png') no-repeat center"}}
      >
        <img src="assets/nufiLogo.svg" alt="NuFi - Crypto Wallet" width={200} />
      </div>
      <div className="nufi-preview-wrapper">
        <div>
          <div className="nufi-preview-list-section">
            <NufiList title={nufiWalletContent.title} list={nufiWalletContent.list} />
            <div className="nufi-preview-cards">
              <h2 className="list-heading">
                You do not need create a transaction to transfer your AdaLite wallet to NuFi
                (Adalite 2.0)
              </h2>
              <div className="nufi-preview-cards-content nufi-preview-content">
                <NufiCard
                  href="https://support.nu.fi/support/solutions/articles/80000956989-cardano-wallet-migration"
                  text="Import your existing AdaLite accounts using your mnemonic (seed phrase), Ledger or Trezor wallet with step-by-step guide in less than one minute"
                  icon={<ImportIcon />}
                />
                <NufiCard
                  href="https://wallet.nu.fi/auth/create_wallet"
                  text="Alternatively create a new wallet"
                  icon={<CreateIcon />}
                />
              </div>
            </div>
          </div>
          <a
            href="https://nufi-official.medium.com/nufi-crypto-staking-made-easy-7e3f80c2c19"
            className="nufi-link center"
          >
            Learn more about NuFi
          </a>
        </div>
        <div>
          <YoutubeEmbed embedId="HQ_cVXZEbXM" />
        </div>
        <div>
          <ComparisonRow
            heading
            firstItem={<p>Quick Comparison between AdaLite & NuFi:</p>}
            secondItem={
              <img
                src="assets/adalite-logo-light.svg"
                alt="AdaLite - Cardano Wallet"
                className="navbar-logo nufi"
              />
            }
            thirdItem={
              <img
                src="assets/nufiLogo.svg"
                alt="NuFi - Crypto Wallet"
                className="navbar-logo nufi"
              />
            }
          />
          {nufiComparisonContent.map((row, i) => (
            <ComparisonRow
              key={i}
              firstItem={<ComparisonLabel {...row.comparison} />}
              secondItem={chooseIcon(row.adalite)}
              thirdItem={chooseIcon(row.nufi)}
            />
          ))}
          <div className="nufi-comparison-item">
            <div className="nufi-comparison-item-end">
              <a href="https://nu.fi/" className="nufi-link center">
                Visit NuFi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NufiPreviewPage
