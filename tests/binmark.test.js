const binmark = require('../src/binmark')

describe('testing parsing to an array of integers', () => {
  test('parsing a stream of hex characters', () => {
    expect(binmark.parse('0123456789abcdef0123456789ABCDEF')).toEqual([
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef
    ])
  })

  describe('ignored characters', () => {
    test('parsing two hex numbers padded with spaces', () => {
      expect(binmark.parse('    10    02    ')).toEqual([0x10, 0x02])
    })

    test('parsing two hex numbers in hex separated with a tab', () => {
      expect(binmark.parse('10\t02')).toEqual([0x10, 0x02])
    })

    test('parsing newline characters and line feeds', () => {
      expect(binmark.parse('01\n\n02\r\r03\r\n')).toEqual([
        0x01, 0x02, 0x03
      ])
    })

    test('parsing hex numbers separated with hyphens', () => {
      expect(binmark.parse('01-23-45-67-89-ab-cd-ef')).toEqual([
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef
      ])
    })

    test('parsing hex numbers separated with colons', () => {
      expect(binmark.parse('01:23:45:67:89:ab:cd:ef')).toEqual([
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef
      ])
    })
  })

  describe('comments', () => {
    test('a line just containing a comment', () => {
      expect(binmark.parse('# Hello World')).toEqual([])
    })

    test('parsing one number followed by a comment', () => {
      expect(binmark.parse('10 # 02')).toEqual([0x10])
    })

    test('a line containing a comment followed by some hex', () => {
      expect(binmark.parse('# Hello World\nCAFE')).toEqual([0xCA, 0xFE])
    })
  })

  describe('decimal integers', () => {
    test('parsing positive decimal integers', () => {
      expect(binmark.parse('.0 .127 .128 .255')).toEqual([
        0, 127, 128, 255
      ])
    })

    test('parsing negative numbers (two\'s complement)', () => {
      expect(binmark.parse('.-1 .-2 .-127 .-128')).toEqual([
        0xff, 0xfe, 0x81, 0x80
      ])
    })

    test('parsing an IPv4 address', () => {
      expect(binmark.parse('.192.168.1.1')).toEqual([
        192, 168, 1, 1
      ])
    })
  })

  describe('strings', () => {
    test('parsing a simple string', () => {
      expect(binmark.parse('"This is a String"')).toEqual([
        0x54, 0x68, 0x69, 0x73, 0x20, 0x69, 0x73, 0x20,
        0x61, 0x20, 0x53, 0x74, 0x72, 0x69, 0x6e, 0x67
      ])
    })

    test('parsing a string with quotes in it', () => {
      expect(binmark.parse('"String with \\"quotes\\".\\r\\n"')).toEqual([
        0x53, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x77,
        0x69, 0x74, 0x68, 0x20, 0x22, 0x71, 0x75, 0x6f,
        0x74, 0x65, 0x73, 0x22, 0x2e, 0x0d, 0x0a
      ])
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

describe('testing parsing binmark to comma separated hex', () => {
  test('parsing two numbers in hex separated with a space', () => {
    expect(binmark.parseToCommaHex('01 02 FF')).toEqual('0x01, 0x02, 0xff')
  })
})
