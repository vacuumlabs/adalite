const fs = require('fs')
const wasmImportString = "import * as wasm from './js_chain_libs_bg.wasm';"
const chainLibsPath = 'node_modules/@emurgo/js-chain-libs/js_chain_libs.js'

fs.readFile(chainLibsPath, 'utf8', (err, data) => {
  if (err) throw err
  const splitArray = data.toString().split('\n')
  if (splitArray[0] === wasmImportString) {
    splitArray.splice(splitArray.indexOf(wasmImportString), 1)
    const result = splitArray.join('\n')
    fs.writeFile(chainLibsPath, result, (err) => {
      if (err) throw err
    })
    // eslint-disable-next-line no-console
    console.log('Removed .wasm import from js-chain-libs.')
  } else {
    // eslint-disable-next-line no-console
    console.log('Wasm import already removed or missing.')
  }
})
