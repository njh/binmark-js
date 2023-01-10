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

  describe('escapes', () => {
    test('parsing an null byte escape sequence', () => {
      expect(binmark.parse('00 \\0')).toEqual([0x00, 0x00])
    })

    test('parsing a CR LF escape sequence', () => {
      expect(binmark.parse(' \\r \\n')).toEqual([0x0d, 0x0a])
    })
  })
})

describe('testing parsing binmark to a hex string', () => {
  test('parsing two numbers in hex separated with a space', () => {
    expect(binmark.parseToHex('10 02')).toEqual('10 02')
  })
})
