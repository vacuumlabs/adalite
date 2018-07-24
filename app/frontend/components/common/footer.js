const {h} = require('preact')
const {VacuumlabsLogo} = require('./svg')

const Footer = () =>
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
