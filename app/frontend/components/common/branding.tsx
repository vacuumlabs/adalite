import {h} from 'preact'

const LOGO_PATH_WHITE = 'assets/vacuumlabs-logo_white.svg'
const LOGO_PATH_DARK = 'assets/vacuumlabs-logo.svg'

interface Props {
  dark: boolean
}

const Branding = ({dark}: Props) =>
  h(
    'div',
    {
      class: 'branding',
    },
    h('p', {class: `branding-label ${dark ? 'dark' : ''}`}, 'Developed by'),
    h('img', {
      class: 'branding-logo',
      src: dark ? LOGO_PATH_DARK : LOGO_PATH_WHITE,
      alt: 'Vacuumlabs logo',
    })
  )

export default Branding
