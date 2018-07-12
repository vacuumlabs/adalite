const {h, Component} = require('preact')

class Tooltip extends Component {
  constructor(props) {
    super(props)
    this.showTooltip = this.showTooltip.bind(this)
    this.hideTooltip = this.hideTooltip.bind(this)
    this.interval = null
    this.state = {active: false}
  }

  showTooltip(e) {
    this.setState({active: true})
    clearTimeout(this.interval)
    this.interval = setTimeout(() => {
      this.interval = null
      this.hideTooltip()
    }, 2000)
  }

  hideTooltip(e) {
    clearTimeout(this.interval)
    this.interval = null
    this.setState({active: false})
  }

  render({tooltip, children}) {
    return h(
      'span',
      {
        class: `with-tooltip ${this.state.active ? 'active' : ''}`,
        tooltip,
        onMouseEnter: this.showTooltip,
        onMouseLeave: this.hideTooltip,
        onClick: this.showTooltip,
      },
      children
    )
  }
}

module.exports = Tooltip
