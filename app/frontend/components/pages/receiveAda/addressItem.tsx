import {h, Component} from 'preact'
import {connect} from '../../../helpers/connect'
import actions from '../../../actions'
import {ADALITE_CONFIG} from '../../../config'
import CopyOnClick from '../../common/copyOnClick'

interface Props {
  openAddressDetail: any
  address: string
  bip32path: string
}

class AddressItem extends Component<Props, {onSmallDevice: boolean}> {
  constructor(props) {
    super(props)
    this.updateDimensions = this.updateDimensions.bind(this)
    this.openAddressDetail = this.openAddressDetail.bind(this)
    this.state = {onSmallDevice: false}
  }

  openAddressDetail({address, bip32path}, copyOnClick) {
    this.props.openAddressDetail({address, bip32path}, copyOnClick)
  }

  updateDimensions() {
    if (window.innerWidth < 768) {
      this.setState({onSmallDevice: true})
    } else {
      this.setState({onSmallDevice: false})
    }
  }

  componentWillMount() {
    this.updateDimensions()
  }
  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }

  render({address, bip32path}) {
    return (
      <div className="address">
        <div className="address-value">
          <p className="address-number no-select">{`/${bip32path.split('/').pop()}`}</p>
          <CopyOnClick value={address} copy={this.state.onSmallDevice}>
            <p className="one-click-select">{address}</p>
          </CopyOnClick>
        </div>
        <div className="address-links blockexplorer-link">
          <CopyOnClick value={address} elementClass="address-link copy">
            <a className="copy-text">Copy Address</a>
          </CopyOnClick>
          <div style="margin-right:24px">
            <span>View on </span>
            {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'byron' && (
              <span>
                <a
                  className="address-link"
                  href={`https://blockchair.com/cardano/address/${address}`}
                  target="_blank"
                  rel="noopener"
                >
                  Blockchair
                </a>
                <span> | </span>
                <a
                  className="address-link"
                  href={`https://adascan.net/address/${address}`}
                  target="_blank"
                  rel="noopener"
                >
                  AdaScan
                </a>
              </span>
            )}
            {ADALITE_CONFIG.ADALITE_CARDANO_VERSION === 'shelley' && (
              <span>
                <a
                  className="address-link"
                  href={`https://cardanoscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener"
                >
                  CardanoScan
                </a>
                {/* <span> | </span> */}
                {/* <a
                  className="address-link"
                  href={`https://explorer.cardano.org/en/address?address=${address}`}
                  target="_blank"
                  rel="noopener"
                >
                  CardanoExplorer
                </a> */}
                <span> | </span>
                <a
                  className="address-link"
                  href={`https://adaex.org/${address}`}
                  target="_blank"
                  rel="noopener"
                >
                  ADAex
                </a>
              </span>
            )}
          </div>
          <a
            className="address-link more"
            onClick={() => this.openAddressDetail({address, bip32path}, this.state.onSmallDevice)}
          >
            View more
          </a>
        </div>
      </div>
    )
  }
}

export default connect(
  null,
  actions
)(AddressItem)
