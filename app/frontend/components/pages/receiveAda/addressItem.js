const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const CopyOnClick = require('../../common/copyOnClick')

class AddressItem extends Component {
  constructor(props) {
    super(props)
    this.updateDimensions = this.updateDimensions.bind(this)
    this.openAddressDetail = this.openAddressDetail.bind(this)
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
    return h(
      'div',
      {class: 'address'},
      h(
        'div',
        {class: 'address-value'},
        h('p', {class: 'address-number no-select'}, `/${bip32path.split('/').pop()}`),
        h(
          CopyOnClick,
          {
            value: address,
            copy: this.state.onSmallDevice,
          },
          h('p', {class: 'one-click-select'}, address)
        )
      ),
      h(
        'div',
        {class: 'address-links blockexplorer-link'},
        h(
          CopyOnClick,
          {
            value: address,
            elementClass: 'address-link copy',
          },
          h('a', {class: 'copy-text'}, 'Copy Address')
        ),
        h(
          'div',
          {},
          h('span', {}, 'View on '),
          h(
            'a',
            {
              class: 'address-link',
              href: `https://seiza.com/blockchain/address/${address}`,
              style: 'margin-right:0',
              target: '_blank',
              rel: 'noopener',
            },
            'Seiza'
          ),
          h('span', {}, ' | '),
          h(
            'a',
            {
              class: 'address-link',
              href: `https://adascan.net/address/${address}`,
              style: 'margin-right:24px',
              target: '_blank',
              rel: 'noopener',
            },
            'AdaScan'
          )
        ),
        h(
          'a',
          {
            class: 'address-link more',
            onClick: () => this.openAddressDetail({address, bip32path}, this.state.onSmallDevice),
          },
          'View more'
        )
      )
    )
  }
}

module.exports = connect(
  {},
  actions
)(AddressItem)
