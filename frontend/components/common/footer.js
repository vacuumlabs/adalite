const {h} = require('preact')

const Footer = () =>
  h(
    'footer',
    {class: 'footer'},
    h(
      'p',
      undefined,
      'Developed by ',
      h(
        'a',
        {href: 'https://vacuumlabs.com', target: '_blank'},
        h('img', {
          src: '/assets/vacuumlabs-logo-dark.svg',
          class: 'logo',
          alt: 'Vacuumlabs Logo',
        })
      )
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
        h('a', {href: 'mailto:cardanolite@vacuumlabs.com'}, 'Contact us')
      ),
      '/',
      h(
        'small',
        {class: 'contact-link'},
        h('a', {href: 'https://twitter.com/hashtag/cardanolite'}, '#cardanolite')
      )
    )
  )

module.exports = Footer
