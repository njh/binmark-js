const binmark = require('../src/binmark')

describe('testing parsing simple binmark markup', () => {
  test('parsing two numbers in hex separated with a space', () => {
    expect(binmark.parse('10 02')).toEqual([0x10, 0x02])
  })

  test('parsing two numbers in hex separated with a tab', () => {
    expect(binmark.parse('10\t02')).toEqual([0x10, 0x02])
  })

  test('parsing two numbers in hex separated with a colon', () => {
    expect(binmark.parse('10:02')).toEqual([0x10, 0x02])

  describe('comments', () => {
    test('a line just containing a comment', () => {
      expect(binmark.parse('# Hello World')).toEqual([])
    })

    test('parsing one number followed by a comment', () => {
      expect(binmark.parse('10 # 02')).toEqual([0x10])
    })
  })
})

describe('testing parsing binmark to a hex string', () => {
  test('parsing two numbers in hex separated with a space', () => {
    expect(binmark.parseToHex('10 02')).toEqual('10 02')
  })
})
