import {h} from 'preact'
import {CloseIcon, CheckIcon, PlayIcon} from './icons'
import {heroTickList, nufiComparisonContent, partners, importSection} from './lists'
import {NufiList, ComparisonRow, ComparisonLabel, YoutubeEmbed} from './utils'

const videoSectionId = 'np-page-video'
const importSectionId = 'np-page-import'

const NufiPreviewPage = () => {
  const chooseIcon = (state: boolean) => (state ? <CheckIcon /> : <CloseIcon />)

  return (
    <main className="np-page np-space-y-15">
      <section className="np-banner" style={{position: 'relative'}}>
        <div className="np-banner__content np-space-y-6" style={{zIndex: 2}}>
          <h1 className="np-heading np-heading--big">Why switch from AdaLite to NuFi?</h1>
          <ul className="np-ul np-ul--icon np-space-y-3">
            <NufiList list={heroTickList} icon={<CheckIcon />} />
          </ul>
          <div className="np-banner__links">
            <a className="np-btn np-btn--primary" href={`#${importSectionId}`}>
              Start now
            </a>
            <a className="np-btn np-btn--secondary" href={`#${videoSectionId}`}>
              <span className="np-text-icon">
                <PlayIcon /> How do I switch to NuFi?
              </span>
            </a>
          </div>
        </div>
        <div className="np-banner__image">
          <img src="assets/nufiPreviewPage/nufi-preview-hero.png" style={{width: '100%'}} />
        </div>
        <div
          className="np-banner__mobile-image"
          style={{
            background: 'url("assets/nufiPreviewPage/heroMobile.png")',
            backgroundSize: 'cover',
            zIndex: 0,
          }}
        />
      </section>
      <section className="np-partners">
        {partners.map(({label, path}) => (
          <img src={path} alt={label} key={label} />
        ))}
      </section>
      <section>
        <ComparisonRow
          heading
          firstItem={<p className="np-comparison-row__title">Wallet features:</p>}
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
            firstItem={<ComparisonLabel {...row} />}
            secondItem={chooseIcon(row.adalite)}
            thirdItem={chooseIcon(row.nufi)}
          />
        ))}
      </section>
      <section className="np-space-y-6" id={importSectionId}>
        <h2 className="np-heading np-text-center">
          How do I import my existing AdaLite wallet into NuFi?
        </h2>
        <br />
        <div className="np-preview__guide">
          <div>
            <ul className="np-ul np-ul--columns np-space-y-3">
              {importSection.map(({title, content}, i) => (
                <li key={i}>
                  <div className="np-text-icon">
                    <span className="np-badge np-badge--number-list">{i + 1}</span>
                    <div className="np-space-y-3">
                      <p>{title}</p>
                      <div>{content}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section id={videoSectionId} className="np-space-y-6">
        <h2 className="np-heading np-text-center">
          Step-by-step guide to importing your AdaLite wallet:
        </h2>
        <YoutubeEmbed embedId="hitK4CZfolA" />
        <br />
        <p className="np-text-section">
          Need more help?{' '}
          <a className="np-link" href="https://support.nu.fi" target="_blank">
            Visit NuFi’s support portal
          </a>{' '}
          for how-to guides or for 1-to-1 customer support.
        </p>
        <p className="np-text-section np-text-section--secondary">
          You can also ask questions about the NuFi wallet and get round-the-clock advice in{' '}
          <a
            className="np-link"
            href="https://discord.com/invite/nufi"
            target="_blank"
            rel="noopener"
          >
            NuFi's Discord server.
          </a>
        </p>
      </section>
    </main>
  )
}

export default NufiPreviewPage
