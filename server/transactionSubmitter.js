const net = require('net')

const cmdtable =
  '0000040000000113841a2d964a0983000100b3048200d8184105058200d8184104068200d818410' +
  '718228200d81842185e18258200d81842185e182b8200d81842185d18318200d81842185c18378200d818421862183' +
  'd8200d81842186118438200d81842186018498200d81842185f18538200d8184100185c8200d818421831185d8200d' +
  '81842182b185e8200d818421825185f8200d81842184918608200d81842184318618200d81842183d18628200d8184' +
  '21837ac048200d8184105058200d8184104068200d81841070d8200d818410018258200d81842185e182b8200d8184' +
  '2185d18318200d81842185c18378200d818421862183d8200d81842186118438200d81842186018498200d81842185' +
  'f18538200d8184100000004000000000953bf09d6cf984ce8cd'

const prefix = '00000402'

module.exports = function(app, env) {
  // eslint-disable-next-line consistent-return
  app.post('/api/txs/submit', (req, res) => {
    let txHash
    let txBody // [1, txBody] in CBOR
    try {
      txHash = req.body.txHash // as hexstring
      txBody = req.body.txBody // [1, txBody] in CBOR
      if (!txHash || !txBody) throw new Error('bad format')
    } catch (err) {
      return res.send(
        JSON.stringify({
          Left: 'Bad request body',
        })
      )
    }

    txBody = `8201${txBody}`

    // INV menssage 00000024 + [0, TxHash] in CBOR  ie. 0...24 + CBOR_prefix + TxHash
    const encodedtxHash = `0000002482005820${txHash}`
    // txSizeInBytes + [1, txBody] in CBOR
    const encodedTx = (txBody.length / 2).toString(16).padStart(8, '0') + txBody
    let code = ''
    let phase = 'not connected'
    let success = false

    const client = new net.Socket()
    client.connect({host: 'relays.cardano-mainnet.iohk.io', port: 3000})

    const initHandshake = () => {
      client.setNoDelay(false)
      phase = 'initilal ping'
      client.write(Buffer.from('00000000000000080000000000000000', 'hex'))
    }

    try {
      client.on('connect', initHandshake)
    } catch (err) {
      res.status(200).send(
        JSON.stringify({
          Left: 'Connection to transaction submission node failed',
        })
      )
    }

    // eslint-disable-next-line consistent-return
    client.on('data', (data) => {
      try {
        switch (phase) {
          case 'initilal ping':
            if (data.toString('hex') !== '00000000') throw new Error('server error')
            client.write(Buffer.from('0000000000000400', 'hex'))
            client.write(Buffer.from(cmdtable, 'hex'))
            phase = 'first actual packet in stream - serial code 400'
            break
          case 'first actual packet in stream - serial code 400':
            if (data.toString('hex') !== '0000000000000400') throw new Error('server error')
            phase = 'exchange of tables of message codes'
            break
          case 'exchange of tables of message codes':
            //if (data.toString("hex") !== serverCmdTable) throw new Error("server error");
            client.write(Buffer.from('00000400000000010d', 'hex'))
            client.write(Buffer.from('0000040000000002182a', 'hex'))
            phase = 'frame 401'
            break
          case 'frame 401':
            if (data.toString('hex') !== '0000000000000401') throw new Error('server error')
            phase = 'frame 401 code'
            break
          case 'frame 401 code':
            code = data.toString('hex')
            client.write(Buffer.from('0000000000000401', 'hex'))
            client.write(Buffer.from(code.replace('953', '941'), 'hex'))
            phase = 'frame 401 answer'
            break
          case 'frame 401 answer':
            if (data.toString('hex') !== '000004010000000105') throw new Error('server error')
            phase = 'frame 401 chunk'
            break
          case 'frame 401 chunk':
            client.write(Buffer.from('0000000100000401', 'hex'))
            phase = 'submit transaction hash'
            break
          case 'submit transaction hash':
            if (data.toString('hex') !== '0000000100000401') throw new Error('server error')
            client.write(Buffer.from('0000000000000402', 'hex'))
            client.write(Buffer.from(code.replace('0401', '0402'), 'hex'))

            client.write(Buffer.from(`${prefix}000000021825`, 'hex'))
            client.write(Buffer.from(prefix + encodedtxHash, 'hex'))
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
            client.write(Buffer.from(prefix + encodedTx, 'hex'))
            phase = 'result'
            break
          case 'result':
            success = data.toString('hex').endsWith('f5')
            client.write(Buffer.from('0000000100000402', 'hex'))
            phase = 'done'
            break
          default:
            client.destroy()
            if (!success) {
              return res.end(
                JSON.stringify({
                  Left: 'Transaction rejected by network',
                })
              )
            }
            return res.end(
              JSON.stringify({
                Right: {
                  txHash,
                },
              })
            )
        }
      } catch (err) {
        return res.status(200).send(
          JSON.stringify({
            Left: 'Transaction submission unexpectedly failed',
          })
        )
      }
    })

    client.on('error', (err) => {
      return res.status(200).send(
        JSON.stringify({
          Left: `Unexpected error on submission node: ${err}`,
        })
      )
    })
  })
}
