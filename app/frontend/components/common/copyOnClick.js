const {h, Component} = require('preact')

const debugLog = require('../../helpers/debugLog')

class CopyOnClick extends Component {
  constructor(props) {
    super(props)
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
    } catch (err) {
      debugLog('Could not copy text: ', err)
    }
  }

  render({elementClass, text, tabIndex, copyBtnRef}) {
    return h(
      'a',
      {
        class: `${elementClass} copy`,
        onClick: this.copyTextToClipboard,
        ref: copyBtnRef,
      },
      text
    )
  }
}

module.exports = CopyOnClick
