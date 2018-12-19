const {h} = require('preact')

const WHITE_LOGO = 'assets/vacuumlabs-logo_white.svg'
const DARK_LOGO = 'assets/vacuumlabs-logo.svg'

const Branding = ({inverse = false}) =>
  h(
    'div',
    {
      class: `branding ${inverse ? 'branding--inverse' : ''}`,
    },
    h('p', {class: 'branding-label'}, 'Developed by'),
    h('img', {class: 'branding-logo', src: inverse ? WHITE_LOGO : DARK_LOGO})
  )

module.exports = Branding
