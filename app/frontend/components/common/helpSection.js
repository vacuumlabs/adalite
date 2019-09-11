const {h} = require('preact')

const HelpSection = () =>
  h(
    'div',
    {},
    h(
      'p',
      {
        class: 'modal-instructions',
      },
      'If you are experiencing problems, please try the following ',
      h(
        'a',
        {
          href: 'https://github.com/vacuumlabs/adalite/wiki',
        },
        'troubleshooting suggestions'
      ),
      ' before contacting us.'
    )
  )

module.exports = HelpSection
