const {h} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../actions')
const {
  BTC_BLOCKCHAIN_EXPLORER,
  BTC_DONATION_ADDRESS,
  ETH_BLOCKCHAIN_EXPLORER,
  ETH_DONATION_ADDRESS,
  ADA_DONATION_ADDRESS,
  ADALITE_SUPPORT_EMAIL,
} = require('../../wallet/constants')

const showRatesOn = ['/txHistory', '/send']

const Footer = connect(
  (state) => ({
    showConversionRates: showRatesOn.indexOf(state.router.pathname) !== -1 && state.walletIsLoaded,
  }),
  actions
)(({openAddressDetail, showConversionRates}) =>
  h(
    'footer',
    {class: 'footer'},
    h(
      'div',
      {class: 'footer__wrapper'},
      h(
        'div',
        undefined,
        h(
          'div',
          {class: 'footer__logo'},
          h('span', {class: 'footer__logo__text'}, 'Developed by '),
          h(
            'a',
            {href: 'https://vacuumlabs.com', target: '_blank', class: 'footer__logo__img'},
            h('img', {src: 'assets/vacuumlabs-logo_light.svg'})
          )
        ),
        h(
          'div',
          {class: 'footer__social'},
          h(
            'span',
            {class: 'footer__social__link'},
            h(
              'a',
              {href: 'https://github.com/vacuumlabs/adalite', target: '_blank'},
              'View on Github'
            )
          ),
          '/',
          h(
            'span',
            {class: 'footer__social__link'},
            h('a', {href: `mailto:${ADALITE_SUPPORT_EMAIL}`, target: '_blank'}, 'Contact us')
          ),
          '/',
          h(
            'span',
            {class: 'footer__social__link'},
            h('a', {href: 'https://t.me/AdaLite', target: '_blank'}, 'Telegram')
          ),
          '/',
          h(
            'span',
            {class: 'footer__social__link'},
            h('a', {href: 'https://twitter.com/AdaLiteWallet', target: '_blank'}, 'Twitter')
          )
        )
      ),
      h(
        'div',
        undefined,
        h(
          'div',
          {class: 'footer__donations'},
          h('div', {class: 'footer__donations__text'}, 'Donations are really appreciated'),
          h(
            'div',
            {class: 'footer__donations__list'},
            h(
              'a',
              {
                class: 'footer__donations__item',
                href: BTC_BLOCKCHAIN_EXPLORER + BTC_DONATION_ADDRESS,
                target: '_blank',
                title: 'link to blockchain explorer',
              },
              h('img', {src: 'assets/bitcoin_icon.svg'}),
              h('span', undefined, 'BTC')
            ),
            h(
              'a',
              {
                class: 'footer__donations__item',
                href: ETH_BLOCKCHAIN_EXPLORER + ETH_DONATION_ADDRESS,
                target: '_blank',
                title: 'link to blockchain explorer',
              },
              h('img', {src: 'assets/ether_icon.svg'}),
              h('span', undefined, 'ETH')
            ),
            h(
              'a',
              {
                class: 'footer__donations__item',
                href: '#',
                onClick: () => openAddressDetail({address: ADA_DONATION_ADDRESS}),
                title: 'show address detail',
              },
              h('img', {src: 'assets/ada_icon.svg'}),
              h('span', undefined, 'ADA')
            )
          )
        ),
        showConversionRates &&
          h(
            'p',
            {class: 'rates'},
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
  )
)

module.exports = Footer
