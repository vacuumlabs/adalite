import * as assert from 'assert'
import {encryptWithPassword} from '../../frontend/helpers/catalyst'

describe('Catalyst voting encrypting with password', () => {
  it('should properly encrypt a password', async () => {
    // @ts-expect-error overwrite getRandomValues to be deterministic
    window.crypto.getRandomValues = (randBytes) => {
      // @ts-expect-error
      randBytes = Buffer.from('0'.repeat(randBytes.length), 'hex')
    }

    const passwordPin = Buffer.from('7777'.split('').map(Number))
    const privateKey = Buffer.from(
      '7837c4cbfbf1e4cb14cfdbd06c3459b215b1849173f3625ef28c3788a1b1c0543639a2dc4c3ae2b7fc1c883d69c4fc2c389f84299fe6ed628f474c34914b197f',
      'hex'
    )
    const encrypted = await encryptWithPassword(passwordPin, privateKey)

    assert.equal(
      encrypted,
      '0100000000000000000000000000000000000000000000000000000000410d2901d38216f4cec0b57d7b8257ab16b3a40960a4d710fd7b068b3f5bd26152f28cfcf29fb5d2524e45404d90f90f7709898995643d0b9f2e13bf103b02d53a6d208785ec442df1aabca9e17e3360'
    )
  }).timeout(5000)
})
