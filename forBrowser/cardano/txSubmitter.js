const net = require('net')
const express = require('express')
const padStart = require('string.prototype.padstart')
padStart.shim()

const bodyParser = require('body-parser')
const URL = 'relays.cardano-mainnet.iohk.io'
const PORT = 3000

const cmdtable =
  '0000040000000113841a2d964a0983000100b3048200d8184105058200d8184104068200d818410' +
  '718228200d81842185e18258200d81842185e182b8200d81842185d18318200d81842185c18378200d818421862183' +
  'd8200d81842186118438200d81842186018498200d81842185f18538200d8184100185c8200d818421831185d8200d' +
  '81842182b185e8200d818421825185f8200d81842184918608200d81842184318618200d81842183d18628200d8184' +
  '21837ac048200d8184105058200d8184104068200d81841070d8200d818410018258200d81842185e182b8200d8184' +
  '2185d18318200d81842185c18378200d818421862183d8200d81842186118438200d81842186018498200d81842185' +
  'f18538200d8184100000004000000000953bf09d6cf984ce8cd'
const serverCmdTable =
  '000004000000011a841a2d964a0983000100b4048200d8184105058200d8184104068200d' +
  '81841070d8200d818410018228200d81842185e18258200d81842185e182b8200d81842185d18318200d81842185c1' +
  '8378200d818421862183d8200d81842186118438200d81842186018498200d81842185f18538200d8184100185c820' +
  '0d818421831185d8200d81842182b185e8200d818421825185f8200d81842184918608200d81842184318618200d81' +
  '842183d18628200d818421837ac048200d8184105058200d8184104068200d81841070d8200d818410018258200d81' +
  '842185e182b8200d81842185d18318200d81842185c18378200d818421862183d8200d81842186118438200d818421' +
  '86018498200d81842185f18538200d8184100000004000000000941bf09d6cf984ce8cd'
const prefix = '00000402'

const app = express()

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.post('/', (req, res) => {
  let txHash
  let txAux // [1, TxAux] in CBOR
  try {
    txHash = req.body.txHash // as hexstring
    txAux = req.body.txBody // [1, TxAux] in CBOR
    if (!txHash || !txHash) throw new Error('bad format')
  } catch (err) {
    return res.status(500).send('bad request format')
  }

  txAux = `8201${txAux}`

  console.log(`submitting transaction ${txHash}`)

  // INV menssage cide(0...24) + [0, TxHash] in CBOR  ie. 0...24 + CBOR_prefix + TxHash
  const encodedtxHash = `${'00000024' + '82005820'}${txHash}`
  // txSizeInBytes + [1, TxAux] in CBOR
  const encodedTx = (txAux.length / 2).toString(16).padStart(8, '0') + txAux
  let code = ''
  let phase = 'not connected'
  let result = false

  const client = new net.Socket()
  client.connect({host: URL, port: PORT})

  const initHandshake = () => {
    client.setNoDelay((noDelay = true))
    phase = 'initilal ping'
    client.write(new Buffer('00000000000000' + '08' + '0000000000000000', 'hex'))
  }

  try {
    client.on('connect', initHandshake)
  } catch (err) {
    res.status(503).send('relay node unreachable')
  }

  client.on('data', (data) => {
    try {
      // console.log(phase + "  " + data.toString("hex"));
      switch (phase) {
        case 'initilal ping':
          if (data.toString('hex') !== '00000000') throw new Error('server error')
          client.write(new Buffer('000000000000' + '0400', 'hex'))
          client.write(new Buffer(cmdtable, 'hex'))
          phase = 'first actual packet in stream - serial code 400'
          break
        case 'first actual packet in stream - serial code 400':
          if (data.toString('hex') !== '0000000000000400') throw new Error('server error')
          phase = 'exchange of tables of message codes'
          break
        case 'exchange of tables of message codes':
          if (data.toString('hex') !== serverCmdTable) throw new Error('server error')
          client.write(new Buffer('00000400000000010d', 'hex'))
          client.write(new Buffer('0000040000000002182a', 'hex'))
          phase = 'frame 401'
          break
        case 'frame 401':
          if (data.toString('hex') !== '0000000000000401') throw new Error('server error')
          phase = 'frame 401 code'
          break
        case 'frame 401 code':
          code = data.toString('hex')
          client.write(new Buffer('0000000000000401', 'hex'))
          client.write(new Buffer(code.replace('953', '941'), 'hex'))
          phase = 'frame 401 answer'
          break
        case 'frame 401 answer':
          if (data.toString('hex') !== '000004010000000105') throw new Error('server error')
          phase = 'frame 401 chunk'
          break
        case 'frame 401 chunk':
          client.write(new Buffer('0000000100000401', 'hex'))
          phase = 'submit transaction hash'
          break
        case 'submit transaction hash':
          if (data.toString('hex') !== '0000000100000401') throw new Error('server error')
          client.write(new Buffer('0000000000000402', 'hex'))
          client.write(new Buffer(code.replace('0401', '0402'), 'hex'))

          client.write(new Buffer(`${prefix}000000021825`, 'hex'))
          client.write(new Buffer(prefix + encodedtxHash, 'hex'))
          phase = 'hash submited'
          break
        case 'hash submited':
          if (data.toString('hex') !== '0000000000000402') throw new Error('server error')
          phase = 'submit transaction'
          break
        case 'submit transaction':
          if (
            data.toString('hex').startsWith('0000402000000094') &&
            data.toString('hex').endsWith(`25${encodedtxHash.substr(9)}`)
          ) {
            throw new Error('server error')
          }
          client.write(new Buffer(prefix + encodedTx, 'hex'))
          phase = 'result'
          break
        case 'result':
          result = data.toString('hex').endsWith('f5')
          client.write(new Buffer('0000000100000402', 'hex'))
          phase = 'done'
          break
        default:
          client.destroy()
          console.log(`${result} ${txHash}`)
          res.end(JSON.stringify({result, txHash}))
      }
    } catch (err) {
      return res
        .status(500)
        .send(
          `${'Submitting transaction failure!  comunication ' +
            'with relay node broken during '}${phase} phase. Please try again later`
        )
    }
  })

  client.on('error', (err) => {
    console.log(err)
    res.status(500).send(`error: ${err}`)
  })
})

app.listen(3001, () => {
  console.log('TCP submitter listening on port 3001!')
})
