import {h} from 'preact'

const LOGO_PATH_WHITE = 'assets/vacuumlabs-logo_white.svg'
const LOGO_PATH_DARK = 'assets/vacuumlabs-logo.svg'

interface Props {
  dark: boolean
}

const Branding = ({dark}: Props) => (
  <div className="branding">
    <p className={`branding-label ${dark ? 'dark' : ''}`}>Developed by</p>
    <img
      className="branding-logo"
      src={dark ? LOGO_PATH_DARK : LOGO_PATH_WHITE}
      alt="Vacuumlabs logo"
    />
  </div>
)

export default Branding
