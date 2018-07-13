const Tooltip = require('./tooltip')
const {h, Component} = require('preact')

class CopyOnClick extends Component {
  constructor(props) {
    super(props)
    this.state = {tooltip: 'Copy to clipboard'}
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
      this.setState({tooltip: 'Copied!'})
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Could not copy text: ', err)
    }
  }

  render({value}, {tooltip}) {
    return h(
      Tooltip,
      {tooltip},
      h('a', {
        class: 'copy margin-1rem',
        onClick: this.copyTextToClipboard,
        onMouseEnter: () => this.setState({tooltip: 'Copy to clipboard'}),
      })
    )
  }
}

module.exports = CopyOnClick
