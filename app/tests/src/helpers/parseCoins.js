import assert from 'assert'
import {parseCoins} from '../../../frontend/helpers/validators'

describe('Ada parsing', () => {
  it('should parse correct lovelace', () => {
    assert(parseCoins('1.000000'), 1000000)
  })
  it('should parse correct lovelace for precision edge case', () => {
    assert(parseCoins('8.131699'), 8131699)
  })
})
