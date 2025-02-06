import {h, Component, Fragment} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import Modal from './modal'
import Alert from './alert'
import ImageModal from './imageModal'
import {localStorageVars} from '../../localStorage'
import {useEffect, useRef, useState} from 'preact/hooks'

const transitionTimeAnimation = '2s'
const transitionTimeNuFiButton = '2s'
const transitionTimeAdaliteButton = '2s'

export function NuFiIframe() {
  const [showIframe, setShowIframe] = useState(false)
  const nufiButtonRef = useRef<HTMLButtonElement | null>(null)
  const [clipPath, setClipPath] = useState<string | null>(null)

  useEffect(() => {
    if (showIframe && nufiButtonRef.current) {
      const element = nufiButtonRef.current
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Reset to 0% immediately
      setClipPath(`circle(0% at ${centerX}px ${centerY}px)`)

      // Use requestAnimationFrame to ensure the 0% state is rendered
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setClipPath(`circle(150% at ${centerX}px ${centerY}px)`)
        })
      )
    } else {
      setClipPath(null)
    }
  }, [showIframe])

  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <button
        id="migrate"
        ref={nufiButtonRef}
        onMouseEnter={() => setShowIframe(true)}
        style={{
          opacity: showIframe ? 0 : 1,
          ...(showIframe ? {transition: `opacity ${transitionTimeNuFiButton} ease`} : {}),
        }}
      />

      <button
        id="migrate-adalite"
        onClick={() => setShowIframe(false)}
        style={{
          opacity: showIframe ? 1 : 0,
          ...(showIframe ? {transition: `opacity ${transitionTimeAdaliteButton} ease`} : {}),
        }}
      />

      <iframe
        id="newUI"
        src="https://localhost:8092"
        style={{
          ...(clipPath ? {clipPath} : {}),
          opacity: clipPath && showIframe ? 1 : 0,
          transition: `clip-path ${transitionTimeAnimation} ease-in-out`,
        }}
      />
    </div>
  )
}

const NewsSection = ({children, date}: {children: any; date?: any}) => (
  <Fragment>
    {date && <h3 className="info-date">{date}</h3>}
    {children}
    <hr className="info-separator" />
  </Fragment>
)

const Article = ({children, title, icon}) => (
  <article className="article">
    <span className={`article-icon ${icon ? `${icon}` : ''}`} />
    <h3 className="article-title">{title}</h3>
    <p className="article-paragraph">{children}</p>
  </article>
)

interface Props {
  closeInfoModal: (dontShowAgain: boolean) => void
}

class InfoModal extends Component<Props, {dontShowAgainCheckbox: boolean; shouldShowImage}> {
  constructor(props) {
    super(props)
    this.state = {
      dontShowAgainCheckbox: window.localStorage.getItem(localStorageVars.INFO_MODAL) === 'true',
      shouldShowImage: false,
    }
    this.checkboxClick = this.checkboxClick.bind(this)
    this.closeInfoModal = this.closeInfoModal.bind(this)
    this.toggleImage = this.toggleImage.bind(this)
  }

  checkboxClick() {
    this.setState({dontShowAgainCheckbox: !this.state.dontShowAgainCheckbox})
  }

  closeInfoModal() {
    this.props.closeInfoModal(this.state.dontShowAgainCheckbox)
  }

  toggleImage(shouldShowImage) {
    this.setState({
      shouldShowImage,
    })
  }

  render({closeInfoModal}, {dontShowAgainCheckbox, shouldShowImage}) {
    return (
      <Modal>
        <section className="welcome">
          <div className="welcome-body">
            <NewsSection
              children={
                <Fragment>
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '32px',
                      lineHeight: 1.4,
                      fontWeight: 'bold',
                      margin: '20px 0',
                      color: 'var(--color-grey-dark)',
                    }}
                  >
                    Trying NuFi was never easier!
                  </div>
                  <div
                    style={{
                      maxWidth: '600px',
                      margin: '0 auto',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: 'var(--color-grey)',
                    }}
                  >
                    <p style={{marginBottom: '16px'}}>
                      We prepared your whole profile for you. Give NuFi a chance and experience a
                      new level of wallet experience.
                    </p>
                    <p>
                      No need to connect your HW wallet every time just to see your balance. Are you
                      a Cardano hodler? Are you active in Cardano DeFi?, do you have assets beyond
                      Cardano?
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '16px',
                      lineHeight: 1.4,
                      fontWeight: 'bold',
                      margin: '20px 0',
                      color: 'var(--color-grey-dark)',
                    }}
                  >
                    We got you covered.
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '24px',
                      lineHeight: 1.4,
                      fontWeight: 'bold',
                      margin: '20px 0',
                      color: 'var(--color-grey-dark)',
                    }}
                  >
                    Just hover over the icon below
                  </div>
                  <NuFiIframe />
                </Fragment>
              }
            />
            <h2 className="welcome-title">AdaLite News</h2>
            <NewsSection
              date={'11/27/2024'}
              children={
                <Fragment>
                  <Article title="AdaLite is now Chang Hardfork #2 ready" icon="">
                    <p className="info-spaced-paragraph">
                      When you delegate, re-delegate or withdraw rewards, we will automatically set
                      the DRep delegation for you to "Always Abstain", if you weren't delegating to
                      a DRep already. If you want to know more, please check "Voting" tab.
                    </p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'11/13/2024'}
              children={
                <Fragment>
                  <Article title="We need your help!" icon="">
                    <p className="info-spaced-paragraph">
                      The NuFi team has submitted 2 proposals in Project Catalyst (Cardano’s
                      on-chain funding initiative) – please use your ADA’s voting power to help us
                      win funding, while earning ADA rewards for yourself.
                    </p>
                    <p className="info-spaced-paragraph">
                      <b>
                        If it’s your first time voting in Catalyst, you need to register to vote
                        before November 20th.
                      </b>
                      You can do this in your AdaLite wallet, on the Voting tab (step by step guide{' '}
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://www.youtube.com/watch?v=b9MDBIFNdaw"
                      >
                        here
                      </a>
                      ).
                    </p>
                    <p>
                      One of our Catalyst proposals is to enhance Bitcoin/Cardano interoperability
                      by enabling users to manage, swap and bridge BTC {'<'}-{'>'} ADA in a single
                      wallet interface (read it{' '}
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://cardano.ideascale.com/c/cardano/idea/132380"
                      >
                        here
                      </a>
                      ). The other proposal is to upgrade a service that 20+ Cardano DApps use to
                      onboard MetaMask and Web2 users (
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://cardano.ideascale.com/c/cardano/idea/132339"
                      >
                        here
                      </a>
                      ).
                    </p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'09/18/2024'}
              children={
                <Fragment>
                  <Article title="Chang Hard Fork" icon="">
                    <p className="info-spaced-paragraph">
                      Chang hard fork was a success; time for decentralized democracy!
                    </p>
                    <p className="info-spaced-paragraph">
                      AdaLite operates as normal. If you want to get involved in governance, you can
                      restore your account (Trezor, Ledger or mnemonic) in the{' '}
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://chromewebstore.google.com/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca"
                      >
                        NuFi extension
                      </a>
                      , then vote through{' '}
                      <a target="_blank" rel="noopener" href="https://gov.tools">
                        GovTools
                      </a>
                      .
                    </p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'08/10/2023'}
              children={
                <Fragment>
                  <Article title="We need your help!" icon="">
                    <p className="info-spaced-paragraph">
                      The AdaLite/NuFi team has submitted a very special proposal in Project
                      Catalyst – Cardano’s on-chain funding initiative – and, with your support, we
                      can win funding to build a toolkit for DApps to onboard Web2 users/crypto
                      beginners into Cardano; users will be able to connect to DApps simply by
                      logging in with a social account or email address, so even Grandma can get
                      into crypto!
                    </p>
                    <p className="info-spaced-paragraph">
                      <b>
                        To vote in Project Catalyst Fund10 and support our proposal, you need to
                        register before August 18th.
                      </b>{' '}
                      We’ve explained our groundbreaking idea and included a how-to guide for
                      registering/voting in Project Catalyst in{' '}
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://nufi-official.medium.com/how-nufis-project-catalyst-proposal-can-onboard-cardano-s-next-1-million-web2-users-4745939c2801"
                      >
                        this article here
                      </a>
                      .
                    </p>

                    <p className="info-spaced-paragraph">Many thanks, The AdaLite/NuFi team</p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'07/10/2023'}
              children={
                <Fragment>
                  <Article title="Project Catalyst Fund10 is here! " icon="">
                    <p className="info-spaced-paragraph">
                      Help shape the future of Cardano by voting for the new products, integrations,
                      tooling, and initiatives that you’d like to see funded.
                    </p>
                    <p className="info-spaced-paragraph">
                      <b>IMPORTANT</b>: you’ll earn ADA rewards if you vote in Fund10, but you need
                      to re-register before August 18th to be eligible to receive voting rewards. If
                      you registered to vote in Fund4 or later, you can still vote without
                      re-registering but you won’t receive voting rewards.
                    </p>

                    <p className="info-spaced-paragraph">
                      SCHEDULE:
                      <ul>
                        <li>Voting registration opens: June 29th 2023</li>
                        <li>Voting registration closes: August 18th 2023</li>
                        <li>Voting period: August 31st to September 14th 2023</li>
                        <li>Voting results: September 21st 2023</li>
                      </ul>
                    </p>

                    <p className="info-spaced-paragraph">
                      What is Project Catalyst? Learn more{' '}
                      <a target="_blank" rel="noopener" href="https://projectcatalyst.io">
                        here
                      </a>
                      .<br />
                      How do I register to vote? How-to video{' '}
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://www.youtube.com/watch?v=b9MDBIFNdaw"
                      >
                        here
                      </a>{' '}
                      and guide{' '}
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://adalite.medium.com/catalyst-voting-registration-on-adalite-71d975f75755"
                      >
                        here
                      </a>
                      .
                    </p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'09/09/2022'}
              children={
                <Fragment>
                  <Article
                    title="Cardano’s Project Catalyst voting started this week and ends September 19th."
                    icon=""
                  >
                    <p className="info-spaced-paragraph">
                      Please support a proposal by NuFi (and the AdaLite team) called{' ‘'}
                      <a
                        target="_blank"
                        rel="noopener"
                        href="https://cardano.ideascale.com/c/idea/419644"
                      >
                        Ethereum and Cardano Web3 Wallet
                      </a>
                      {'’ '}in The Great Migration (from Ethereum) challenge.
                    </p>
                    <p className="info-spaced-paragraph">
                      NuFi’s proposal will help projects migrate to Cardano by making the
                      cross-chain experience easy: you’ll be able to manage Ethereum, Milkomeda and
                      Cardano accounts side by side, migrate assets between chains, and connect to
                      Dapps on each chain simultaneously using just your NuFi wallet. We'd really
                      appreciate your vote before September 19th.
                    </p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'08/02/2022'}
              children={
                <Fragment>
                  <Article title="Vote for NuFi in Project Catalyst" icon="">
                    <ul>
                      <li>
                        Register to vote in Project Catalyst before August 4th and support NuFi’s
                        proposal: "Ethereum and Cardano Web3 Wallet"
                      </li>
                      <li>
                        Full details and how to register{' '}
                        <a
                          target="_blank"
                          rel="noopener"
                          href="https://nufi-official.medium.com/catalyst-voting-starts-soon-e119f740b080"
                        >
                          here
                        </a>
                      </li>
                    </ul>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'07/21/2022'}
              children={
                <Fragment>
                  <Article title="Are you Ledger Nano S user?" icon="">
                    <p>
                      Please take five minutes to complete{' '}
                      <a target="_blank" rel="noopener" href="https://iohk.link/NuFi">
                        this survey
                      </a>{' '}
                      to help us improve the user experience of the{' '}
                      <strong>Cardano app on Ledger</strong>
                    </p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'07/14/2022'}
              children={
                <Fragment>
                  <Article
                    title="New from NuFi: Chrome extension with dApp connector now available"
                    icon=""
                  >
                    <ul>
                      <li>
                        Connect to Cardano dApps like NFT marketplaces, DEXes and more using a NuFi
                        wallet
                      </li>
                      <li>
                        Don't have a NuFi wallet? It takes less than 30 seconds to migrate from
                        AdaLite
                      </li>
                      <li>
                        Full details and instructions{' '}
                        <a
                          target="_blank"
                          rel="noopener"
                          href="https://nufi-official.medium.com/connect-to-nft-marketplaces-dexes-and-other-dapps-with-nufi-wallets-new-chrome-extension-a559ffe4e5a3"
                        >
                          here
                        </a>
                      </li>
                    </ul>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'02/03/2022'}
              children={
                <Fragment>
                  <Article
                    title="Warning: The Cardano blockchain is heavily congested. This means that:"
                    icon=""
                  >
                    <ul>
                      <li>
                        Some transactions are taking a long time to submit and you may see
                        'Transaction pending' for longer than expected.
                      </li>
                      <li>
                        You may need to wait for up to 1 hour before you see confirmation of a
                        successful transaction in your wallet's transaction history or on a
                        blockchain explorer.
                      </li>
                      <li>
                        Some transactions are failing outright, while others are displaying an error
                        message but submitting successfully after some time. Please read this
                        article{' '}
                        <a
                          href="https://github.com/vacuumlabs/adalite/wiki/Troubleshooting#my-transaction-has-been-pending-for-a-long-time--what-should-i-do"
                          target="_blank"
                          rel="noopener"
                        >
                          here
                        </a>{' '}
                        for advice on what to do if a transaction fails.
                      </li>
                    </ul>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'12/15/2021'}
              children={
                <Article
                  title="We are thrilled to announce that NuFi (AdaLite 2.0) is now live!"
                  icon=""
                >
                  <ul>
                    <li>
                      Stake, send and receive coins, tokens and NFTs across multiple blockchains
                      from a single interface.
                    </li>
                    <li>
                      Currently supports Cardano (ADA) and Solana (SOL) blockchains, with FLOW
                      integration coming early 2022 and 10 additional PoS blockchains to be added
                      throughout the year.
                    </li>
                    <li>
                      Import your existing AdaLite accounts using your mnemonic, Ledger or Trezor
                      wallet (step-by-step guides{' '}
                      <a
                        href="https://support.nu.fi/support/solutions/articles/80000956989-cardano-wallet-migration"
                        target="_blank"
                        rel="noopener"
                      >
                        here
                      </a>
                      )
                    </li>
                    <li>
                      Starting Dec. '21, we're implementing a visual NFT gallery with bulk sending
                      functionality and soon to come in-app crypto purchases by card/bank transfer,
                      a Cardano DEX and much, much more!
                    </li>
                    <li>
                      We'll announce new features on{' '}
                      <a href="https://twitter.com/nufi_official" target="_blank" rel="noopener">
                        Twitter
                      </a>{' '}
                      and in our{' '}
                      <a href="https://discord.gg/jSyVPAXw3w" target="_blank" rel="noopener">
                        Discord
                      </a>{' '}
                      community.
                    </li>
                  </ul>
                  <p>
                    Get started at{' '}
                    <a
                      href="https://nu.fi?utm_source=adalite&utm_medium=infoModal"
                      target="_blank"
                      rel="noopener"
                    >
                      https://nu.fi
                    </a>{' '}
                    or learn more about NuFi in our Medium article{' '}
                    <a
                      href="https://nufi-official.medium.com/7e3f80c2c19"
                      target="_blank"
                      rel="noopener"
                    >
                      HERE
                    </a>
                    .
                  </p>
                  <p>
                    <b>
                      We are dedicated to AdaLite, it still plays an important role in the Cardano
                      ecosystem and will continue to operate as normal.
                    </b>
                  </p>
                </Article>
              }
            />
            <NewsSection
              date={'11/29/2021'}
              children={
                <Article title="AdaLite now supports BitBox02" icon="">
                  We are excited to announce that AdaLite is now compatible with{' '}
                  <a
                    href="https://shiftcrypto.ch/bitbox02/?ref=8s4tkJYX1x"
                    target="_blank"
                    rel="noopener"
                  >
                    BitBox02
                  </a>{' '}
                  hardware wallet. The device currently supports sending and staking ADA, and
                  support for Cardano tokens/NFTs will be added in the future.{' '}
                  <a
                    href="https://shiftcrypto.support/help/en-us/35-adalite-cardano/176-adalite-guide"
                    target="_blank"
                    rel="noopener"
                  >
                    Learn more
                  </a>
                </Article>
              }
            />
            <NewsSection
              date={'11/18/2021'}
              children={
                <Article title="Catalyst Fund7 registration" icon="">
                  Adalite supports Catalyst Fund7 voting registration starting on 18th of November,
                  11:00 UTC. Take a look at our{' '}
                  <a
                    href="https://adalite.medium.com/catalyst-voting-registration-on-adalite-71d975f75755"
                    target="_blank"
                    rel="noopener"
                  >
                    voting registration article
                  </a>{' '}
                  to find out more about the registration. If you successfully
                  <strong>
                    {' '}
                    registered and voted in Fund4, Fund5 or Fund6 and you still have the QR code and
                    PIN code, your registration is valid
                  </strong>{' '}
                  in Fund7 as well. Additional information can be found on the{' '}
                  <a href="https://catalyst.ideascale.com/" target="_blank" rel="noopener">
                    Catalyst webpage
                  </a>{' '}
                  or in{' '}
                  <a
                    href="https://iohk.zendesk.com/hc/en-us/articles/900006490763-Project-Catalyst-FAQ"
                    target="_blank"
                    rel="noopener"
                  >
                    this FAQ
                  </a>
                  .
                </Article>
              }
            />
            <NewsSection
              date={'11/11/2021'}
              children={
                <Fragment>
                  <Article title="NuFi (Adalite 2.0) BETA" icon="">
                    <p className="info-spaced-paragraph">
                      <strong>
                        We are excited to announce that our new NuFi Wallet (AdaLite 2.0) is ready
                        for testing, and we invite you to join our community as a beta tester!
                      </strong>
                    </p>
                    <p className="info-spaced-paragraph">
                      You asked, we listened! We are proud to announce that we are launching closed
                      beta testing for our NuFi platform. If you are an early adopter and would like
                      to participate in the testing that will shape our product, please register
                      through the following Discord link and follow the instructions in Discord:{' '}
                      <a href="https://discord.gg/jSyVPAXw3w" target="_blank" rel="noopener">
                        https://discord.gg/jSyVPAXw3w
                      </a>
                      . Please note, the number of beta-tester spots is limited.
                    </p>
                    <p className="info-spaced-paragraph">
                      NuFi's beta wallet supports Cardano and Solana blockchains, and as a beta
                      tester, you'll be able to send, receive, and stake crypto in the app. What's
                      yet to come is the "Exchange" functionality and displaying more comprehensive
                      info about stake pools and tokens from the respective registries. Also some
                      less-essential content has placeholders (visibly empty or marked as
                      "TBD"/"Coming Soon"/"...").
                    </p>
                    <p className="info-spaced-paragraph">
                      We’ll be providing regular updates on Discord.
                    </p>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'11/08/2021'}
              children={
                <Fragment>
                  <Article title="We are hiring!" icon="">
                    We are looking to hire a{' '}
                    <a
                      href="https://drive.google.com/file/d/1NsoD4bMAq_f5JtGebRobFr1RRC1Db1JB/view?usp=sharing"
                      target="_blank"
                      rel="noopener"
                    >
                      Chief Marketing Officer
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://drive.google.com/file/d/17TNdyi4qokDo0CYGX_K4yGT5ymbot4i0/view?usp=sharing"
                      target="_blank"
                      rel="noopener"
                    >
                      Community Manager
                    </a>{' '}
                    for one of our partner projects. Please send your inquiries to{' '}
                    <a href={'mailto:michal@adalite.io'}>michal@adalite.io</a>
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'09/13/2021'}
              children={
                <Fragment>
                  <Article title="Possibly missing rewards in staking history" icon="">
                    One of the cardano components we use may be missing some of the rewards. For
                    this reason, staking history and CSV exports may be wrong. However, your staking
                    balance is unaffected by this issue and you can freely withdraw your correct
                    amount of rewards.
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'09/13/2021'}
              children={
                <Fragment>
                  <Article title="Trezor signing planned outage" icon="">
                    On September 15th, between 14:00 and 15:00 UTC, signing transactions with Trezor
                    hardware wallets is expected to fail while we update Adalite to support the
                    upcoming Trezor firmware.
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'09/06/2021'}
              children={
                <Fragment>
                  <Article title="Token registry" icon="">
                    We fixed a bug related to the token registry support and re-enabled the feature.
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'08/24/2021'}
              children={
                <Fragment>
                  <Article title="Token registry bug" icon="">
                    We had to roll back token registry support due to a bug where wallets with many
                    distinct tokens were not able to load. We will investigate this issue further
                    and provide a fix as soon as possible.
                  </Article>
                  <Article title="Reward withdrawal issues" icon="">
                    There is a bug in rewards withdrawal affecting users who voted and are eligible
                    for Catalyst Fund 5 rewards. These users are currently unable to withdraw their
                    rewards. The fix will be available by the next epoch (287).
                  </Article>
                </Fragment>
              }
            />
            <NewsSection
              date={'08/12/2021'}
              children={
                <Article title="Catalyst Fund6 registration" icon="">
                  Adalite supports Catalyst Fund6 voting registration starting on 12th of August,
                  11:00 UTC. Take a look at our{' '}
                  <a
                    href="https://adalite.medium.com/catalyst-voting-registration-on-adalite-71d975f75755"
                    target="_blank"
                    rel="noopener"
                  >
                    voting registration article
                  </a>{' '}
                  to find out more about the registration. If you successfully
                  <strong>
                    {' '}
                    registered and voted in Fund4 or Fund5 and you still have the QR code and PIN
                    code, your registration is valid
                  </strong>{' '}
                  in Fund6 as well. Additional information can be found on the{' '}
                  <a href="https://catalyst.ideascale.com/" target="_blank" rel="noopener">
                    Catalyst webpage
                  </a>{' '}
                  or in{' '}
                  <a
                    href="https://www.reddit.com/r/cardano/comments/p2xpi8/project_catalyst_all_you_need_to_know_fund6_voter/"
                    target="_blank"
                    rel="noopener"
                  >
                    this Reddit post
                  </a>
                  .
                </Article>
              }
            />
            <NewsSection
              date={'07/16/2021'}
              children={
                <Article title="Staking rewards withdrawal bug" icon="">
                  There is a bug in rewards withdrawal affecting users who voted and are eligible
                  for Catalyst Fund 4 rewards. These users are currently unable to withdraw their
                  rewards. This should be fixed in the next epoch 279 starting on 20th of July 2021.
                </Article>
              }
            />
            <NewsSection
              date={'07/08/2021'}
              children={
                <Article title="Catalyst Fund5 registration" icon="">
                  Adalite supports Catalyst Fund5 voting registration beginning 8th of July, 16:00
                  UTC. Check out our{' '}
                  <a
                    href="https://adalite.medium.com/catalyst-voting-registration-on-adalite-71d975f75755"
                    target="_blank"
                    rel="noopener"
                  >
                    voting registration article
                  </a>{' '}
                  to find out more about the registration. Please note that if you successfully
                  registered and voted in Fund4 and you still have the QR code and PIN code, your
                  registration is valid in Fund5 as well. You can find additional information on the{' '}
                  <a href="https://catalyst.ideascale.com/" target="_blank" rel="noopener">
                    Catalyst webpage
                  </a>{' '}
                  or in{' '}
                  <a
                    href="https://www.reddit.com/r/cardano/comments/ofo1bz/fund_5_register_to_vote_all_you_need_to_know/"
                    target="_blank"
                    rel="noopener"
                  >
                    this Reddit post
                  </a>
                  .
                </Article>
              }
            />
            <h3 className="info-date">06/18/2021</h3>
            <Article title="Catalyst voting information" icon="">
              <p className="info-spaced-paragraph">
                If you registered your vote for Catalyst Fund 4, you can vote until June 25. Please
                find more information on this{' '}
                <a
                  href="https://www.reddit.com/r/cardano/comments/nziy41/all_you_need_to_know_fund4_voting_updated/"
                  target="_blank"
                  rel="noopener"
                >
                  link
                </a>
                .
              </p>
              <p className="info-spaced-paragraph">
                If you missed this round, please note that the registration for Fund 5 should start
                around July 6th. We will try to give you more upfront notice.
              </p>
              <p className="info-spaced-paragraph">
                If you are thinking who to support in this Catalyst round, we have two good
                candidates for you:
                <ul>
                  <li>
                    CardanoScan.io is the best block explorer in Cardano ecosystem. You can support
                    their project{' '}
                    <a
                      href="https://cardano.ideascale.com/a/dtd/Ouroboros-Networking-Lib-in-JS/342248-48088"
                      target="_blank"
                      rel="noopener"
                    >
                      here
                    </a>
                    .
                  </li>
                  <li>
                    Dusan would like to build a security passphrase recovery tool for HW wallets
                    users. Support him{' '}
                    <a
                      href="https://cardano.ideascale.com/a/dtd/HW-wallet-passphrase-recovery-tool/341440-48088"
                      target="_blank"
                      rel="noopener"
                    >
                      here
                    </a>
                    .
                  </li>
                </ul>
              </p>
            </Article>
            <h3 className="info-date">06/10/2021</h3>
            <Article title="Catalyst voting for hardware wallets" icon="">
              We implemented the catalyst voting support for hardware wallets (Ledger, Trezor) and
              mnemonic wallets. The voting feature can be found in the "Voting" interface. To
              participate, follow the instructions within Adalite and the registration dialog.
              Alternatively, consult our{' '}
              <a
                href="https://adalite.medium.com/catalyst-voting-registration-on-adalite-71d975f75755"
                target="_blank"
                rel="noopener"
              >
                medium article
              </a>{' '}
              on how to register for Catalyst voting using Adalite. The registration ends on 11th of
              June, during which a snapshot of your balance is taken. Make sure to possess at least
              500 ADA on your wallet at that time if you want your registration to count.
            </Article>
            <hr className="info-separator" />
            <h3 className="info-date">03/01/2021</h3>
            <Article title="Mary hard fork update" icon="">
              We successfully updated AdaLite to support Mary hard fork. No action needed by the
              users. This Cardano protocol update introduces multi-assets (tokens) that can be sent
              over the Cardano network. The received and sent tokens will be shown in the
              transaction history. Currently, you can see the list of your tokens (if you have any)
              only in the drop-down menu in the "Send" interface. We will soon reorganize the wallet
              to provide a more convenient way to list multicurrency tokens. We also temporarily
              removed the "Buy/Sell ADA" feature and the Stake Pool Owner support for pledging from
              HW wallets. Both of these features will be back online in ~1 week.
            </Article>
            <hr className="info-separator" />
            <h3 className="info-date">02/23/2021</h3>
            <Article title="Request for a short survey" icon="">
              Cardano will undergo Mary hard-fork on 1st March 2021. No action is needed by the
              users. This hard-fork will introduce multi-assets to Cardano blockchain. AdaLite will
              support this feature since day 1. In the meantime - help us make AdaLite better by
              completing{' '}
              <a
                href="https://us9.list-manage.com/survey?u=a4ef0e2eec6beca874d360490&id=9aa07f5f0e"
                target="_blank"
                rel="noopener"
              >
                this short (2-3 minutes) survey
              </a>
              .
            </Article>
            <hr className="info-separator" />
            <h3 className="info-date">01/14/2021</h3>
            <Article title="Multi-account support and partial delegation" icon="">
              AdaLite is introducing the concept of wallet accounts. Apart from other benefits, this
              should allow the users to delegate to multiple staking pools from a single wallet.
              When compared to standard banking products, accounts in cryptocurrency wallets work
              similarly as sub-accounts to your main bank account.
            </Article>
            <Alert alertType="news">
              Please note, as of now, the accounts are supported only on AdaLite and you won’t be
              able to access funds transferred to accounts other than the first account on different
              wallets such as Daedalus and Yoroi. But it is very likely that this concept will be
              introduced to other wallets in the future too.
            </Alert>
            <Article title="New features" icon="">
              With the latest update, AdaLite adds two new tabs, the Account tab, and the Advanced
              tab. <b>Advanced tab</b> shows some public keys related information about your wallet
              and also interface for support of stake pool owners for Trezor and Ledger. For more
              information about stakepool owner support read{' '}
              <a
                href="https://adalite.medium.com/cardano-stake-pool-owners-hw-support-6d9278dba0ba"
                target="_blank"
                rel="noopener"
              >
                here
              </a>
              .
            </Article>
            <Article title="Account tab" icon="">
              The main purpose of the <b>Accounts tab</b> is to enable users to switch between
              accounts, transfer funds between them easily, and also to serve as a dashboard for
              them. At the top of the page, you can see your total balance and total rewards balance
              which is a sum of balances on all accounts. Please notice, the label of the Account
              tab always displays the index of the currently active account. All the other content
              (transaction history, balances, etc.) on the Sending, Staking, and Advanced tab always
              corresponds to the currently active account. For more information about accounts, how
              they work and how to use them on AdaLite, read here{' '}
              <a
                href="https://adalite.medium.com/multi-account-support-and-partial-delegation-fd96aa793f9d"
                target="_blank"
                rel="noopener"
              >
                here
              </a>
              .
            </Article>
            <hr className="info-separator" />
            <h3 className="info-date">11/23/2020</h3>
            <Alert alertType="news">
              <b> WARNING: </b> According to latest information from IOHK, users should check the
              saturation level of their pools and redelegate if their pool is saturated before{' '}
              <b> December 1, 21:44 UTC.</b> The k parameter change will become effective on 6th
              December and therefore the delegation changes need to be done 1 epoch in advance.
            </Alert>
            <Article title="Pool saturation" icon="">
              For users that are delegating to a saturated pool, we display a warning and also
              recommend and prefill one of the AdaLite pools with optimal saturation level. Latest
              release also brought some additional information to "Current delegation" tab,
              including Live stake, ROI and Saturation percentage.
            </Article>
            <hr className="info-separator" />
            <h3 className="info-date">11/16/2020</h3>
            <Article title="Decreased saturation level from 6th December" icon="">
              IOHK decided to increase the K parameter for staking to 500 on December 6th. This will
              result in a decreased saturation level of pools (~62 million ADA). Therefore starting
              this date, all pools that will have more than 62 million ADA delegated to them will
              receive a penalty on rewards.
            </Article>
            <Alert alertType="news">
              <b>
                {' '}
                ADA holders should make sure that the pool they are delegating to is not over the
                saturation level before the <s>
                  234 epoch boundary at 21:44 UTC on December 6
                </s>{' '}
                (the 233 epoch boundary at 21:44 UTC on December 1.).{' '}
              </b>{' '}
              You can redelegate at any point between now and the change. Over the following week,
              we will implement new features to inform users about the Live Stake of the pool they
              are delegating to. Also, as the date of the change will be closing, we will be
              displaying warnings to users that are delegating to a pool that could possibly be
              oversaturated.
            </Alert>
            <Article title="AdaLite Stake Pools delegators" icon="">
              We have already set up two new pools ADLT4 and ADLT5 in order to support this change.
              We encourage delegators from ADLT, ADLT2 and ADLT3 pools to slowly migrate to any of
              the new pools. We will create new pools as needed.
            </Article>
            <Article title="VIP staking services" icon="">
              We are offering special personalized services to delegators that want to work with us
              and have holdings over 5 million ADA. We will assign you a dedicated account manager
              and provide you with priority support. We will proactively inform you about any
              important developments in the Cardano ecosystem. Additionally, you can consult with us
              anything that is Cardano related. Just for this occasion, to help you manage the
              saturation level change, we are lowering the volume to access these VIP services to 3
              million ADA. Drop me a line to{' '}
              <a href={'mailto:michal.petro@vacuumlabs.com'}>michal.petro@vacuumlabs.com</a>. If you
              want to stay anonymous, you can contact me on{' '}
              <a href="https://t.me/AdaLite" target="_blank" rel="noopener">
                Telegram
              </a>
              .
            </Article>
            <Article title="AdaLite stakepools performance" icon="">
              All our pools are showing stable appropriate performance and ROI variance is within
              the expected limits. Long term ROI our pools are achieving:
              <br />
              ADLT - 5.40%
              <br />
              ADLT2 - 5.24%
              <br />
              ADLT3 - 5.71%
            </Article>
            <Article title="AdaLite now shows rewards history" icon="">
              Latest AdaLite release brought rewards per epoch history (Staking screen &gt; Staking
              and Rewards History tab) and few other small changes. Rewards history was also
              included in the history export CSV file.
            </Article>
            <Article title="Rewards withdrawal issue" icon="">
              The issue with withdrawing rewards that some of our users are currently experiencing,
              has not been solved yet and IOHK is working on a fix.
            </Article>
            <hr className="info-separator" />
            <h3 className="info-date">11/13/2020</h3>
            <Article title="Rewards withdrawal" icon="">
              Some users are currently experiencing problems with withdrawing their rewards. This is
              a temporary issue and your rewards are safe. We will resolve this issue as soon as
              possible.
            </Article>
            <hr className="info-separator" />
            <h3 className="info-date">8/19/2020</h3>
            <Article title="Staking and Rewards" icon="">
              Staking was introduced to Cardano in a recent Shelley update. You can now delegate
              your ADA to a stake pool that will be mining blocks and you will receive rewards for
              it. This can be done on the new Staking screen accessible through the Staking button
              on the upper left side of the AdaLite user interface. Funds that are staked are not
              locked and are free move. All your staking balance (which are all your funds that are
              on the new Shelley addresses) is staked with the pool that you delegate to. If you
              still have some funds on your non-staking balance, please convert them (which will
              create a transaction that transfers funds to one of your new addresses). There is no
              "unstake" functionality implemented yet but you can always re-delegate to a different
              pool or transfer the funds as you want.
            </Article>
            <Alert alertType="news">
              <b>
                First rewards (for people that delegated their stake on or before 8th August) will
                be distributed in the epoch that starts on 23rd August
              </b>{' '}
              (this was postponed by IOHK from the originally announced date of 18th August). You
              should be receiving rewards at the end of each epoch afterward (~5 days).
              <p>
                Please refer to{' '}
                <a href="#" onClick={() => this.toggleImage(true)}>
                  this
                </a>{' '}
                image if you want to know more about how the staking cycle works. In general, after
                you stake, it will take 15-20 days to receive first rewards but after that, you
                should be receiving rewards periodically every five days.
              </p>
            </Alert>
            <Article title="Staking with AdaLite" icon="">
              We have two staking pools available for our users - pools ADLT and ADLT2.{' '}
              <b>So far we were able to mint all the blocks that were assigned to us.</b> We will be
              using funds that we collect on fees for further development of AdaLite. One of our
              pools IDs will be always pre-filled in the Stake Delegation tab but if you for some
              reason don't want to stake with us you can always change it to different pool.{' '}
              <b>Over 2000 people delegated to our pools, thank you!</b> We really appreciate your
              support and we will work hard to keep AdaLite up to date with upcoming new Cardano
              features.
            </Article>
            <Article title="New feature for Ledger users" icon="">
              Ledger HW wallet users can now connect their devices through experimental WebUSB
              standard by clicking on the Connect with WebUSB when accessing their wallet. This
              should bring a better user experience but is supported only on a limited number of
              devices. For Windows users, this works best with Chrome and Windows 10. For Mac users,
              this is already the default protocol when clicking on "Access with Ledger" button (but
              if the protocol is not supported by the OS or browser, we automatically fall back to
              the old U2F standard).
            </Article>
          </div>
          <div className="welcome-footer">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={dontShowAgainCheckbox}
                onChange={this.checkboxClick}
                className="checkbox-input"
              />
              <span className="checkbox-indicator">{undefined}</span>Don't show on startup again.
            </label>
            <button
              onClick={this.closeInfoModal}
              className="button primary wide modal-button"
              onKeyDown={(e) => {
                e.key === 'Enter' && (e.target as HTMLButtonElement).click()
              }}
            >
              Close
            </button>
          </div>
        </section>
        {shouldShowImage && <ImageModal closeModal={() => this.toggleImage(false)} />}
      </Modal>
    )
  }
}

export default connect(
  (state) => ({
    displayInfoModal: state.displayInfoModal,
  }),
  actions
)(InfoModal)
