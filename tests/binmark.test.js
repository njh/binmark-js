const binmark = require('../src/binmark')
const path = require('path')
const fs = require('fs')

function readFixture (filename) {
  // FIXME: could we do this asynchronously?
  return fs.readFileSync(
    path.resolve(__dirname, './fixtures/' + filename),
    'ascii'
  )
}

function testFixture (name, descripton) {
  const bm = readFixture(`${name}.bm`)
  const expected = readFixture(`${name}.expect`)

  test(descripton, () => {
    const result = binmark.parseToHex(bm)
    expect(result).toEqual(expected)
  })
}

describe('testing parsing to an array of integers', () => {
  test('parsing a stream of hex characters', () => {
    expect(binmark.parse('0123456789abcdef0123456789ABCDEF')).toEqual([
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef
    ])
  })

  test('parsing hex value with an invalid second character', () => {
    expect(() => {
      binmark.parse('01 02 0Z')
    }).toThrow('got non-hex digit after hex digit: Z')
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

  describe('8-bit decimal integers', () => {
    test('parsing positive decimal integers', () => {
      expect(binmark.parse('.0 .127 .128 .255')).toEqual([
        0, 127, 128, 255
      ])
    })

    test('parsing negative numbers (two\'s complement)', () => {
      expect(binmark.parse('.-1 .-2 .-127')).toEqual([
        0xff, 0xfe, 0x81
      ])
    })

    test('parsing an IPv4 address', () => {
      expect(binmark.parse('.192.168.1.1')).toEqual([
        192, 168, 1, 1
      ])
    })

    test('parsing a number with no valid characters', () => {
      expect(() => {
        binmark.parse('.Z')
      }).toThrow('no valid characters after start of 8-bit integer')
    })

    test('parsing a number that is greater than 255', () => {
      expect(() => {
        binmark.parse('.256')
      }).toThrow('8-bit integer is greater than 255: 256')
    })

    test('parsing a number that is less than -127', () => {
      expect(() => {
        binmark.parse('.-128')
      }).toThrow('8-bit integer is less than -127: -128')
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

    test('parsing a string with no contents', () => {
      expect(binmark.parse('01"')).toEqual([0x01])
    })
  })

  describe('escapes', () => {
    test('parsing an null byte escape sequence', () => {
      expect(binmark.parse('00 \\0')).toEqual([0x00, 0x00])
    })

    test('parsing a CR LF escape sequence', () => {
      expect(binmark.parse(' \\r \\n')).toEqual([0x0d, 0x0a])
    })

    test('parsing an escape that we don\'t recognise', () => {
      expect(() => {
        binmark.parse('01 \\D')
      }).toThrow('invalid escape sequence: D')
    })

    test('parsing an escape with nothing after it', () => {
      expect(binmark.parse('01 \\')).toEqual([0x01])
    })

    testFixture('escapes', 'parsing all valid escape sequences')
  })

  describe('invalid characters', () => {
    test('parsing a string with a G in it', () => {
      expect(() => {
        binmark.parse('CC DD EE FF GG')
      }).toThrow('unrecognised character in input: G')
    })

    test('parsing a string with a S in it', () => {
      expect(() => {
        binmark.parse('01 02 S 03')
      }).toThrow('unrecognised character in input: S')
    })
  })
})

describe('testing parsing binmark to a hex string', () => {
  test('parsing two numbers in hex separated with default', () => {
    expect(binmark.parseToHex('10 02')).toEqual('10 02')
  })

  test('parsing three numbers in hex separated with a colon', () => {
    expect(binmark.parseToHex('01 02 03', ':')).toEqual('01:02:03')
  })
})

describe('testing parsing binmark to comma separated hex', () => {
  test('parsing two numbers in hex separated with a space', () => {
    expect(binmark.parseToCommaHex('01 02 FF')).toEqual('0x01, 0x02, 0xff')
  })
})

describe('more complex test cases from fixture files', () => {
  testFixture('ipv4_dns_packet', 'IPv4 DNS packet')
  testFixture('ipv6_udp_packet', 'IPv6 UDP packet')
  testFixture('mqtt_connect', 'MQTT Connect packet')
  testFixture('mqtt_publish', 'MQTT Publish packet')
  testFixture('pgm_feep', 'Binary PGM Image file')
})
