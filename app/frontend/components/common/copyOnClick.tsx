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
    e.preventDefault()
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

  render(
    {
      children,
      elementClass = '',
      copy = true,
      enableTooltip = true,
      inline = false,
      tooltipMessage = 'Copied to clipboard',
    },
    {copied}
  ) {
    return h(
      inline ? 'span' : 'p',
      {
        className: `${elementClass} thin-data-balloon`,
        onClick: copy && this.copyTextToClipboard,
        ...tooltip(tooltipMessage, true, copied && enableTooltip),
      },
      children
    )
  }
}

export default CopyOnClick
