import {h, Component} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import Modal from './modal'
import Alert from './alert'
import Branding from './branding'
import {localStorageVars} from '../../localStorage'

const Article = ({children, title, icon}) => (
  <article className="article">
    <span className={`article-icon ${icon ? `${icon}` : ''}`} />
    <h3 className="article-title">{title}</h3>
    <p className="article-paragraph">{children}</p>
  </article>
)

const Credits = () => (
  <section className="credits">
    <Branding dark />
    <p className="credits-paragraph">
      AdaLite was not created by Cardano Foundation, Emurgo, or IOHK. This project was created with
      passion by Vacuumlabs. We appreciate any feedback, donation or contribution to the codebase.
    </p>
  </section>
)

interface WelcomeProps {
  closeWelcome: (dontShowAgain: boolean) => void
}

class Welcome extends Component<WelcomeProps, {dontShowAgainCheckbox: boolean}> {
  constructor(props) {
    super(props)
    this.state = {
      dontShowAgainCheckbox: window.localStorage.getItem(localStorageVars.WELCOME) === 'true',
    }
    this.checkboxClick = this.checkboxClick.bind(this)
    this.closeWelcome = this.closeWelcome.bind(this)
  }

  checkboxClick() {
    this.setState({dontShowAgainCheckbox: !this.state.dontShowAgainCheckbox})
  }

  closeWelcome() {
    this.props.closeWelcome(this.state.dontShowAgainCheckbox)
  }

  render({closeWelcome}, {dontShowAgainCheckbox}) {
    return (
      <Modal>
        <section className="welcome">
          <div className="welcome-body">
            <h2 className="welcome-title">Welcome to AdaLite wallet</h2>
            <p className="welcome-subtitle">
              We are an open-source client-side interface for direct interaction with the Cardano
              blockchain.
            </p>
            <Alert alertType="warning">
              To be safe from losing access to your funds, please read the following advice
              carefully.
            </Alert>
            <div className="welcome-articles">
              <Article title="Don't lose your mnemonic" icon="mnemonic">
                A new wallet is created by generating a cryptographic set of words (mnemonic). You
                use it to access your funds on the Cardano blockchain. We don't store your mnemonic,
                and there is no way to reset it. If you lose your mnemonic, we cannot help you to
                restore the access to your funds.
              </Article>
              <Article title="Protect your funds" icon="funds">
                The mnemonic is handled in your browser and never leaves your computer. However, if
                a virus or a hacker compromises your computer, the attacker can steal the mnemonic
                you entered on the AdaLite website and access your funds.
              </Article>
              <Article title="Consider using a hardware wallet" icon="wallet">
                AdaLite allows you to access your funds using a hardware wallet. It currently
                supports Trezor model T, Ledger Nano X, Ledger Nano S and BitBox02. This enables you
                to interact with AdaLite in the safest manner possible without giving away your
                mnemonic. An attacker can’t steal your mnemonic or private key since they don’t
                leave Ledger.
              </Article>
              <Article title="Don't get phished" icon="phishing">
                To protect yourself from phishers, bookmark the official AdaLite address and{' '}
                <b>
                  always check the URL. The official address is{' '}
                  {'https://adalite.io/' /* prettier does not like // */}.
                </b>
              </Article>
            </div>
            <Credits />
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
              onClick={this.closeWelcome}
              className="button primary wide modal-button"
              onKeyDown={(e) => {
                e.key === 'Enter' && (e.target as HTMLButtonElement).click()
              }}
            >
              Continue to AdaLite
            </button>
          </div>
        </section>
      </Modal>
    )
  }
}

export default connect(null, actions)(Welcome)
