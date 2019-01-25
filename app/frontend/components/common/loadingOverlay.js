const {h} = require('preact')
const connect = require('unistore/preact').connect

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

module.exports = LoadingOverlay
