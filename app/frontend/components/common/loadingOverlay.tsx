import {h} from 'preact'
import {connect} from '../../libs/unistore/preact'

interface Props {
  loading: boolean
  loadingMessage: string
}

const LoadingOverlay = connect(['loadingMessage', 'loading'])(
  ({loading, loadingMessage}: Props) =>
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
