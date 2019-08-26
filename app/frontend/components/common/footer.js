const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../actions')
const Branding = require('./branding')
const {
  BTC_BLOCKCHAIN_EXPLORER,
  BTC_DONATION_ADDRESS,
  ETH_BLOCKCHAIN_EXPLORER,
  ETH_DONATION_ADDRESS,
  ADA_DONATION_ADDRESS,
} = require('../../wallet/constants')

const showRatesOn = ['/txHistory', '/send']

const Footer = connect(
  (state) => ({
    showConversionRates: showRatesOn.indexOf(state.router.pathname) !== -1 && state.walletIsLoaded,
  }),
  actions
)(({openAddressDetail, showConversionRates, showContactFormModal}) =>
  h(
    'footer',
    {class: 'footer'},
    h(
      'div',
      {class: 'footer-wrapper'},
      h(Branding),
      h(
        'div',
        {class: 'footer-row'},
        h(
          'div',
          {class: 'social'},
          h(
            'button',
            {
              role: 'button',
              class: 'social-link email',
              onClick: showContactFormModal,
            },
            'Contact us'
          ),
          h(
            'a',
            {
              href: 'https://t.me/AdaLite',
              target: '_blank',
              rel: 'noopener',
              class: 'social-link telegram',
            },
            'Telegram'
          ),
          h(
            'a',
            {
              href: 'https://github.com/vacuumlabs/adalite',
              target: '_blank',
              rel: 'noopener',
              class: 'social-link github',
            },
            'View on Github'
          ),
          h(
            'a',
            {
              href: 'https://twitter.com/AdaLiteWallet',
              target: '_blank',
              rel: 'noopener',
              class: 'social-link twitter',
            },
            'Twitter'
          )
        ),
        h(
          'div',
          {class: 'donations'},
          h('h3', {class: 'donations-title'}, 'Donations are appreciated'),
          h(
            'a',
            {
              class: 'donations-item bitcoin',
              href: BTC_BLOCKCHAIN_EXPLORER + BTC_DONATION_ADDRESS,
              target: '_blank',
              title: 'Donate via Bitcoin',
              rel: 'noopener',
            },
            'BTC'
          ),
          h(
            'a',
            {
              class: 'donations-item ether',
              href: ETH_BLOCKCHAIN_EXPLORER + ETH_DONATION_ADDRESS,
              target: '_blank',
              title: 'Donate via Ethereum',
              rel: 'noopener',
            },
            'ETH'
          ),
          h(
            'a',
            {
              class: 'donations-item ada',
              href: `https://seiza.com/blockchain/address/${ADA_DONATION_ADDRESS}`,
              target: '_blank',
              title: 'Donate via Adalite',
              rel: 'noopener',
            },
            'ADA'
          )
        )
      ),
      showConversionRates &&
        h(
          'div',
          {class: 'conversion'},
          'Conversion rates from ',
          h(
            'a',
            {
              class: 'conversion-link',
              href: 'https://www.cryptocompare.com/api/',
              target: '_blank',
              rel: 'noopener',
            },
            'CryptoCompare'
          )
        )
    )
  )
)

module.exports = Footer
