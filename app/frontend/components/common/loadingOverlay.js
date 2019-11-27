import {h} from 'preact'
import {connect} from 'unistore/preact'

const LoadingOverlay = connect(['loadingMessage', 'loading'])(
  ({loading, loadingMessage}) =>
    loading
      ? h(
        'div',
        {class: 'loading'},
        h('div', {class: 'spinner'}, h('span', undefined)),
        loadingMessage ? h('p', {class: 'loading-message'}, loadingMessage) : ''
      )
      : null
)

export default LoadingOverlay
