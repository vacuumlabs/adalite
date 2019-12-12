import {h, ComponentChildren} from 'preact'

interface Props {
  alertType:
    | 'success'
    | 'error'
    | 'info sidebar'
    | 'warning sidebar'
    | 'success sidebar'
    | 'warning'
    | 'error_event'
    | 'info auth'
  children: ComponentChildren
}

const Alert = ({children, alertType = 'success'}: Props) => (
  <div className={`alert ${alertType}`}>
    <div className="alert-content">{children}</div>
  </div>
)

export default Alert
