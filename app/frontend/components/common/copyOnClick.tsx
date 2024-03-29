import {h, Component, ComponentChildren} from 'preact'

import debugLog from '../../helpers/debugLog'
import tooltip from './tooltip'

interface Props {
  value: any
  copiedCallback?: (copied: boolean) => any
  elementClass?: string
  copy?: boolean
  enableTooltip?: boolean
  children: ComponentChildren
  inline?: boolean
  tooltipMessage?: string
  stopPropagation?: boolean
  preventDefault?: boolean
}

class CopyOnClick extends Component<Props, {copied: boolean}> {
  constructor(props) {
    super(props)
    this.state = {copied: false}
    this.fallbackCopyTextToClipboard = this.fallbackCopyTextToClipboard.bind(this)
    this.copyTextToClipboard = this.copyTextToClipboard.bind(this)
  }

  fallbackCopyTextToClipboard() {
    const input = document.createElement('textarea')
    input.value = this.props.value
    input.style.zIndex = '-1'
    input.style.position = 'fixed'
    input.style.top = '0'
    input.style.left = '0'
    document.body.appendChild(input)
    input.focus()
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }

  async copyTextToClipboard(e) {
    this.props.preventDefault && e.preventDefault()
    this.props.stopPropagation && e.stopPropagation()
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.props.value)
      } else {
        this.fallbackCopyTextToClipboard()
      }
      this.setState({copied: true})
      this.props.copiedCallback && this.props.copiedCallback(true)
      setTimeout(() => {
        this.setState({copied: false})
        this.props.copiedCallback && this.props.copiedCallback(false)
      }, 3000)
    } catch (err) {
      debugLog(`Could not copy text: ${err}`)
    }
  }

  render() {
    const {
      children,
      elementClass = '',
      copy = true,
      enableTooltip = true,
      tooltipMessage = 'Copied to clipboard',
    } = this.props
    const {copied} = this.state
    return (
      <span
        className={`${elementClass} thin-data-balloon`}
        onClick={copy ? this.copyTextToClipboard : () => null}
        {...tooltip(tooltipMessage, true, copied && enableTooltip)}
      >
        {children}
      </span>
    )
  }
}

CopyOnClick.defaultProps = {
  preventDefault: true,
}

export default CopyOnClick
