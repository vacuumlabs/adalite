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
      'Developed by ',
      h('a', {href: 'https://vacuumlabs.com', target: '_blank'}, h(VacuumlabsLogo))
    ),
    h(
      'p',
      undefined,
      h(
        'small',
        {class: 'contact-link'},
        h(
          'a',
          {href: 'https://github.com/vacuumlabs/cardanolite', target: '_blank'},
          'View on Github'
        )
      ),
      '/',
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'mailto:cardanolite@vacuumlabs.com', target: '_blank'}, 'Contact us')
      ),
      '/',
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'https://twitter.com/hashtag/cardanolite', target: '_blank'}, '#cardanolite')
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
    )
  )
)

module.exports = Footer
