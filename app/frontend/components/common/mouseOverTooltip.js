const {h, Component} = require('preact')
const tooltip = require('./tooltip')

class MouseOverTooltip extends Component {
  constructor(props) {
    super(props)
    this.state = {isActive: false}
    this.showTooltip = this.showTooltip.bind(this)
    this.hideTooltip = this.hideTooltip.bind(this)
  }

  showTooltip() {
    this.setState({isActive: true})
  }

  hideTooltip() {
    this.setState({isActive: false})
  }

  render(
    {elementClass = '', linkText = '', enableTooltip = true, tooltipText = '', linkClass = ''},
    {isActive}
  ) {
    return h(
      'a',
      {
        class: `${elementClass}`,
        onMouseEnter: this.showTooltip,
        onMouseLeave: this.hideTooltip,
        ...tooltip(tooltipText, true, isActive && enableTooltip),
      },
      h('span', {class: linkClass}, linkText)
    )
  }
}

module.exports = MouseOverTooltip
