import {Component} from 'preact'

interface Props {
  isEnabled: boolean
  timeoutMs: number
  onTimeout: () => void
}

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'touchstart',
  'click',
  'scroll',
  'keypress',
] as const

class InactivityWatcher extends Component<Props, {}> {
  timer: ReturnType<typeof setTimeout> | undefined

  constructor(props) {
    super(props)
    this.resetTimer = this.resetTimer.bind(this)
  }

  resetTimer() {
    if (!this.props.isEnabled) return
    if (this.timer !== undefined) clearTimeout(this.timer)
    this.timer = setTimeout(this.props.onTimeout, this.props.timeoutMs)
  }

  registerListeners() {
    ACTIVITY_EVENTS.forEach((eventName) => document.addEventListener(eventName, this.resetTimer))
  }

  unregisterListeners() {
    ACTIVITY_EVENTS.forEach((eventName) => document.removeEventListener(eventName, this.resetTimer))
  }

  clearTimer() {
    if (this.timer !== undefined) clearTimeout(this.timer)
    this.timer = undefined
  }

  componentDidMount() {
    if (this.props.isEnabled) {
      this.registerListeners()
      this.resetTimer()
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isEnabled && this.props.isEnabled) {
      this.registerListeners()
      this.resetTimer()
      return
    }

    if (prevProps.isEnabled && !this.props.isEnabled) {
      this.unregisterListeners()
      this.clearTimer()
      return
    }

    if (
      this.props.isEnabled &&
      (prevProps.timeoutMs !== this.props.timeoutMs || prevProps.onTimeout !== this.props.onTimeout)
    ) {
      this.resetTimer()
    }
  }

  componentWillUnmount() {
    this.unregisterListeners()
    this.clearTimer()
  }

  render() {
    return null
  }
}

export default InactivityWatcher
