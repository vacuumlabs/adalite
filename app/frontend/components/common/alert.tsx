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

const Alert = ({children, alertType = 'success'}: Props) =>
  h(
    'div',
    {
      class: `alert ${alertType}`,
    },
    h('div', {class: 'alert-content'}, children)
  )

export default Alert
