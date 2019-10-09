const {h, Component} = require('preact')

const debugLog = require('../../helpers/debugLog')
const tooltip = require('./tooltip')

class CopyOnClick extends Component {
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
      debugLog('Could not copy text: ', err)
    }
  }

  render({children, elementClass, copy = true, enableTooltip = true, onMobile = false}, {copied}) {
    return h(
      'a',
      {
        class: `${elementClass}`,
        onClick: copy && this.copyTextToClipboard,
        ...tooltip('Ahoj', true, true),
        // 'data-balloon': onMobile ? 'Ahoj' : 'Copied to clipboard!',
        // 'data-balloon-visible': copied ? 'true' : '',
      },
      children
    )
  }
}

module.exports = CopyOnClick
