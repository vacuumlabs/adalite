const {Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../actions')
const {ADALITE_LOGOUT_AFTER} = require('../config').ADALITE_CONFIG

class AutoLogout extends Component {
  constructor(props) {
    super(props)
    this.resetTimer = this.resetTimer.bind(this)
    this.logout = this.logout.bind(this)
  }

  logout() {
    this.props.logout()
    this.props.setLogoutNotificationOpen(true)
  }

  resetTimer() {
    if (this.props.walletIsLoaded) {
      clearTimeout(this.timer)
      this.timer = setTimeout(this.logout, ADALITE_LOGOUT_AFTER * 1000)
    }
  }

  registerListeners() {
    document.onmousemove = this.resetTimer
    document.onmousedown = this.resetTimer
    document.ontouchstart = this.resetTimer
    document.onclick = this.resetTimer
    document.onscroll = this.resetTimer
    document.onkeypress = this.resetTimer
  }

  unregisterListeners() {
    document.onmousemove = null
    document.onmousedown = null
    document.ontouchstart = null
    document.onclick = null
    document.onscroll = null
    document.onkeypress = null
  }

  componentDidMount() {
    this.props.walletIsLoaded && this.registerListeners()
    this.resetTimer()
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.walletIsLoaded !== this.state.walletIsLoaded
  }

  componentDidUpdate(prevProps) {
    if (this.props.walletIsLoaded) {
      this.registerListeners()
      this.resetTimer()
    } else {
      this.unregisterListeners()
      clearTimeout(this.timer)
    }
  }

  render() {
    return null
  }
}

module.exports = connect(
  (state) => ({
    walletIsLoaded: state.walletIsLoaded,
  }),
  actions
)(AutoLogout)
