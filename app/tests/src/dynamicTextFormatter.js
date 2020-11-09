import assert from 'assert'

import {underlineNonBip39words} from '../../frontend/helpers/dynamicTextFormatter'

describe('dynamic text formatter - underlineNonBip39words', () => {
  it('should remmove new lines', () => {
    const input = '<div><span><br></span></div>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '',
      rawText: '',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should wrap words into spans', () => {
    const input =
      'hill safe victory sun tired fetch police radio sport output buyer deny april fringe stumble'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText:
        '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>&nbsp;<span>sun</span>&nbsp;<span>tired</span>&nbsp;<span>fetch</span>&nbsp;<span>police</span>&nbsp;<span>radio</span>&nbsp;<span>sport</span>&nbsp;<span>output</span>&nbsp;<span>buyer</span>&nbsp;<span>deny</span>&nbsp;<span>april</span>&nbsp;<span>fringe</span>&nbsp;<span>stumble</span>',
      rawText: input,
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should style nonbip-39 word', () => {
    const input = 'hil'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span class="not-bip-39">hil</span>',
      rawText: input,
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should wrap span around new word at the start of the line - letter', () => {
    const input = 'h&nbsp;<span>safe</span>&nbsp;<span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText:
        '<span class="not-bip-39">h</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'h safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should wrap span around new word at the start of the line - word', () => {
    const input = 'hill&nbsp;<span>safe</span>&nbsp;<span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should wrap span around new word in the middle of line - letter', () => {
    const input = '<span>hill</span>&nbsp;s&nbsp;<span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText:
        '<span>hill</span>&nbsp;<span class="not-bip-39">s</span>&nbsp;<span>victory</span>',
      rawText: 'hill s victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should wrap span around new word in the middle of line - word', () => {
    const input = '<span>hill</span>&nbsp;safe&nbsp;<span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should wrap span around new word in the end of the line - letter', () => {
    const input = '<span>hill</span>&nbsp;<span>safe</span>&nbsp;v'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText:
        '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span class="not-bip-39">v</span>',
      rawText: 'hill safe v',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should wrap span around new word in the end of the line - word', () => {
    const input = '<span>hill</span>&nbsp;<span>safe</span>&nbsp;victory'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should split words by delimiter - whitespace', () => {
    const input = '<span>hill</span>&nbsp;<span>safe&nbsp;victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should split words by delimiter - comma', () => {
    const input = '<span>hill</span>,<span>safe,victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>,<span>safe</span>,<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should merge words if there is no delimiter between them', () => {
    const input =
      '<span>hill</span>&nbsp;<span class="not-bip-39">sa</span><span class="not-bip-39">fe</span>&nbsp;<span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should append to wrapped word - letter', () => {
    const input =
      '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span class="not-bip-39">victor</span>y'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should append to wrapped word - word', () => {
    const input =
      '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span class="not-bip-39">victo</span>ry'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should prepend to wrapped word - letter', () => {
    const input =
      '<span>hill</span>&nbsp;s<span class="not-bip-39">afe</span>&nbsp;<span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should prepend to wrapped word - word', () => {
    const input =
      '<span>hill</span>&nbsp;sa<span class="not-bip-39">fe</span>&nbsp;<span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should extract delimiters outside of spans - whitespace', () => {
    const input = '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory&nbsp;</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>&nbsp;',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should extract delimiters outside of spans - comma', () => {
    const input = '<span>hill</span>,<span>safe</span>,<span>victory,</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>,<span>safe</span>,<span>victory</span>,',
      rawText: 'hill safe victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('should remove empty spans', () => {
    const input = '<span>hill</span>&nbsp;<span></span><span>victory</span>'
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText: '<span>hill</span>&nbsp;<span>victory</span>',
      rawText: 'hill victory',
    }

    assert.deepEqual(result, expectedResult)
  })

  it('simulated input', () => {
    const input =
      'hill safe victory sun tired fetch police radio sport output buyer deny april fringe stumble'
    let accumulator = {
      formattedText: '',
      rawText: '',
    }
    input.split('').forEach((letter) => {
      accumulator = underlineNonBip39words(`${accumulator.formattedText}${letter}`)
    })
    const result = underlineNonBip39words(input)
    const expectedResult = {
      formattedText:
        '<span>hill</span>&nbsp;<span>safe</span>&nbsp;<span>victory</span>&nbsp;<span>sun</span>&nbsp;<span>tired</span>&nbsp;<span>fetch</span>&nbsp;<span>police</span>&nbsp;<span>radio</span>&nbsp;<span>sport</span>&nbsp;<span>output</span>&nbsp;<span>buyer</span>&nbsp;<span>deny</span>&nbsp;<span>april</span>&nbsp;<span>fringe</span>&nbsp;<span>stumble</span>',
      rawText: input,
    }

    assert.deepEqual(result, expectedResult)
  })
})
