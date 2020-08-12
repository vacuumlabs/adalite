import {h, Component} from 'preact'
import {connect} from '../../helpers/connect'
import actions from '../../actions'
import Modal from './modal'
import Alert from './alert'
import Branding from './branding'

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

interface Props {
  closeInfoModal: (dontShowAgain: boolean) => void
}

class InfoModal extends Component<Props, {dontShowAgainCheckbox: boolean}> {
  constructor(props) {
    super(props)
    this.state = {
      dontShowAgainCheckbox: window.localStorage.getItem('dontShowInfoModal') === 'true',
    }
    this.checkboxClick = this.checkboxClick.bind(this)
    this.closeInfoModal = this.closeInfoModal.bind(this)
  }

  checkboxClick() {
    this.setState({dontShowAgainCheckbox: !this.state.dontShowAgainCheckbox})
  }

  closeInfoModal() {
    this.props.closeInfoModal(this.state.dontShowAgainCheckbox) // TODO: true
  }

  render({closeInfoModal}, {dontShowAgainCheckbox}) {
    return (
      <Modal>
        <section className="welcome">
          <div className="welcome-body">
            <h2 className="welcome-title">AdaLite News</h2>
            <p className="welcome-subtitle">Shelley update</p>
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
            <Article title="" icon="">
              <p>
                <b>
                  First rewards (for people that delegated their stake on or before 8th August) will
                  be distributed in the epoch that starts on 23rd August
                </b>{' '}
                (this was postponed by IOHK from the originally announced date of 18th August). You
                should be receiving rewards at the end of each epoch afterward (~5 days). Please
                refer to this image if you want to know more about how the staking cycle works. In
                general, after you stake, it will take 15-20 days to receive first rewards but after
                that, you should be receiving rewards periodically.
              </p>
            </Article>
            <Article title="Staking with AdaLite" icon="">
              We have two staking pools available for our users - pools ADLT and ADLT2. We will be
              using funds that we collect on fees for further development of AdaLite. One of our
              pools IDs will be always pre-filled in the Stake Delegation tab but if you for some
              reason don't want to stake with us, you can always change it to a different pool. We
              would like to thank all those 2100 people that already delegated their stake to us! We
              really appreciate your support and we will work hard to keep AdaLite up to date with
              upcoming Cardano new features.
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
            <Article title="AdaLite exchange temporary outage" icon="">
              We removed the link to our in-wallet exchange because our partner is not able to
              process payments to Shelley addresses yet. We will restore this service once our
              partner fixes this and be fully operational again. Sorry for the inconvenience.
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
              onClick={closeInfoModal}
              className="button primary wide modal-button"
              onKeyDown={(e) => {
                e.key === 'Enter' && (e.target as HTMLButtonElement).click()
              }}
            >
              Close
            </button>
          </div>
        </section>
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
