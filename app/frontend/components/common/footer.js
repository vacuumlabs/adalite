const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../actions')
const {
  BTC_BLOCKCHAIN_EXPLORER,
  BTC_DONATION_ADDRESS,
  ETH_BLOCKCHAIN_EXPLORER,
  ETH_DONATION_ADDRESS,
  ADA_DONATION_ADDRESS,
} = require('../../wallet/constants')
const {VacuumlabsLogo} = require('./svg')

const Footer = connect(
  {},
  actions
)(({openAddressDetail}) =>
  h(
    'footer',
    {class: 'footer'},
    h(
      'p',
      undefined,
      h('span', {class: 'footer-text-before-logo'}, 'Developed by '),
      h('a', {href: 'https://vacuumlabs.com', target: '_blank'}, h(VacuumlabsLogo))
    ),
    h(
      'p',
      undefined,
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'https://github.com/vacuumlabs/adalite', target: '_blank'}, 'View on Github')
      ),
      '/',
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'mailto:adalite@vacuumlabs.com', target: '_blank'}, 'Contact us')
      ),
      '/',
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'https://twitter.com/AdaLiteWallet', target: '_blank'}, '#AdaLite')
      )
    ),
    h(
      'p',
      undefined,
      h('div', undefined, 'Donations are really appreciated! '),
      h(
        'div',
        undefined,
        h(
          'span',
          undefined,
          h(
            'a',
            {
              class: 'contact-link',
              href: BTC_BLOCKCHAIN_EXPLORER + BTC_DONATION_ADDRESS,
              target: '_blank',
              title: 'link to blockchain explorer',
            },
            'BTC'
          ),
          '/'
        ),
        h(
          'span',
          undefined,
          h(
            'a',
            {
              class: 'contact-link',
              href: ETH_BLOCKCHAIN_EXPLORER + ETH_DONATION_ADDRESS,
              target: '_blank',
              title: 'link to blockchain explorer',
            },
            'ETH'
          ),
          '/'
        ),
        h(
          'span',
          undefined,
          h(
            'a',
            {
              class: 'contact-link',
              href: '#',
              onClick: () => openAddressDetail({address: ADA_DONATION_ADDRESS}),
              title: 'show address detail',
            },
            'ADA'
          )
        )
      )
    ),
    h(
      'p',
      undefined,
      h('div', undefined, 'Conversion rates from '),
      h(
        'a',
        {
          class: 'contact-link',
          href: 'https://www.cryptocompare.com/api/',
          target: '_blank',
        },
        'CryptoCompare'
      )
    )
  )
)

module.exports = Footer
