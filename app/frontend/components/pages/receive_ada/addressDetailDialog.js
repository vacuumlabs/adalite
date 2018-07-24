const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../../actions')

const Tooltip = require('../../common/tooltip')
const CopyOnClick = require('../../common/copyOnClick')
const {CloseIcon, LinkIcon} = require('../../common/svg')

const AddressDetailDialog = connect(
  (state) => ({
    showDetail: state.showAddressDetail,
    showVerification: state.showAddressVerification,
    error: state.addressVerificationError,
  }),
  actions
)(
  ({showDetail, showVerification, error, closeAddressDetail}) =>
    showDetail &&
    h(
      'div',
      {class: 'overlay fade-in-up'},
      !showVerification &&
        h('div', {
          class: 'overlay-close-layer',
          onClick: closeAddressDetail,
        }),
      h(
        'div',
        {class: 'box'},
        h(
          'span',
          {
            class: 'overlay-close-button',
            onClick: closeAddressDetail,
          },
          h(CloseIcon)
        ),
        h(
          'div',
          undefined,
          h('b', undefined, 'Address:'),
          h(
            'div',
            {class: 'full-address-row'},
            h(
              'span',
              {
                class: `full-address ${showVerification ? 'no-select' : 'selectable'}`,
              },
              showDetail.address
            )
          ),
          showVerification
            ? h(
              'div',
              undefined,
              h('b', undefined, 'Derivation path:'),
              h(
                'div',
                {class: 'full-address-row'},
                h('span', {class: 'full-address'}, showDetail.bip32path)
              ),
              h(
                'b',
                undefined,
                'Verify that the address and derivation path shown on Trezor matches!'
              )
            )
            : h(
              'div',
              undefined,
              h(
                'div',
                {class: 'centered-row'},
                h(CopyOnClick, {value: showDetail.address}),
                h(
                  Tooltip,
                  {tooltip: 'Examine via CardanoExplorer.com'},
                  h(
                    'a',
                    {
                      href: `https://cardanoexplorer.com/address/${showDetail.address}`,
                      target: '_blank',
                      class: 'address-link margin-1rem centered-row',
                    },
                    h(LinkIcon)
                  )
                )
              )
            )
        )
      )
    )
)

module.exports = AddressDetailDialog
