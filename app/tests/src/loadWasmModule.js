import loadWasmModule from '../../frontend/helpers/wasmLoader'

// Note(ppershing): we have to monkey-patch this because `fetch()` api does not support
// file:///scheme
export default async () => {
  const _fetch = window.fetch

  window.fetch = (url) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = function() {
        const headers = new Headers()
        headers.append('Content-type', 'application/wasm')
        resolve(new Response(xhr.response, {status: 200, headers}))
      }
      xhr.onerror = function() {
        reject(new TypeError('Local request failed'))
      }
      xhr.open('GET', url)
      xhr.responseType = 'blob'
      xhr.send(null)
    })

  await loadWasmModule()
  window.fetch = _fetch
}
