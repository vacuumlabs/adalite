const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')
const DetailIcon = require('../../common/svg').DetailIcon

const Tooltip = require('../../common/tooltip')

const AddressContainer = connect(
  {},
  actions
)(({address, bip32path, openAddressDetail}) =>
  h(
    'div',
    {class: 'address-wrap'},
    h('b', {class: 'address address-start no-events'}, `/${bip32path.split('/')[5]}`),
    h(
      'span',
      {class: 'address shrinked no-events'},
      h('span', {class: 'shrinklable'}, address.substr(0, address.length - 8))
    ),
    h('span', {class: 'address address-end no-events'}, address.substr(address.length - 10)),
    h(
      Tooltip,
      {tooltip: 'Show\u00A0full\u00A0address'},
      h(
        'a',
        {
          class: 'show-address-detail margin-top-s',
          onClick: () => openAddressDetail({address, bip32path}),
        },
        h(DetailIcon)
      )
    )
  )
)

module.exports = AddressContainer
