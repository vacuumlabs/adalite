const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const CopyOnClick = require('../../common/copyOnClick')

const AddressItem = connect(
  {},
  actions
)(({address, bip32path, openAddressDetail}) =>
  h(
    'div',
    {class: 'address'},
    h(
      'div',
      {class: 'address-value'},
      h('p', {class: 'address-number no-select'}, `/${bip32path.split('/').pop()}`),
      h('p', {class: 'one-click-select'}, address)
    ),
    h(
      'div',
      {class: 'address-links blockexplorer-link'},
      h(CopyOnClick, {
        value: address,
        elementClass: 'address-link',
        text: 'Copy Address',
      }),
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
          onClick: () => openAddressDetail({address, bip32path}),
        },
        'View more'
      )
    )
  )
)

module.exports = AddressItem
