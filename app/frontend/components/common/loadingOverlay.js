const {h} = require('preact')
const connect = require('unistore/preact').connect

const LoadingOverlay = connect(['loadingMessage', 'loading'])(
  ({loading, loadingMessage}) =>
    loading
      ? h(
        'div',
        {class: 'overlay ontop'},
        h('div', {class: 'loading'}),
        loadingMessage ? h('p', undefined, loadingMessage) : ''
      )
      : null
)

module.exports = LoadingOverlay
