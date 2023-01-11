
function escapeToHex (chr) {
  switch (chr) {
    case '0': return 0x00
    case 'a': return 0x07
    case 'b': return 0x08
    case 'f': return 0x0C
    case 'n': return 0x0A
    case 'r': return 0x0D
    case 't': return 0x09
    case 'v': return 0x0B
    case '\\': return 0x5C
    case '\'': return 0x27
    case '"': return 0x22
    case '?': return 0x3F
    default:
      return undefined
  }
}

function isSpace (c) {
  return c === ' ' ||
        c === '\n' ||
        c === '\t' ||
        c === '\r' ||
        c === '\f' ||
        c === '\v'
}

function isDecimalChar (c) {
  const code = c.charCodeAt(0)
  return (code >= 0x30 && code <= 0x39)
}

function isHexChar (c) {
  const code = c.charCodeAt(0)
  return (code >= 0x41 && code <= 0x46) || // A-F
         (code >= 0x61 && code <= 0x66) || // a-F
         (code >= 0x30 && code <= 0x39) // 0-9
}

function parse (input) {
  const output = []

  for (let i = 0; i < input.length; i++) {
    const chr = input[i]

    if (isSpace(chr) || chr === ':' || chr === '-') {
      /* Ignore */
      continue
    } else if (chr === '#') {
      /* Ignore the rest of the line */
      while (true) {
        const chr2 = input[++i]
        if (chr2 === undefined || chr2 === '\n' || chr2 === '\r') { break }
      }
    } else if (isHexChar(chr)) {
      const chr2 = input[++i]
      if (!isHexChar(chr2)) {
        throw new Error('got non-hex digit after hex digit: ', chr2)
      }

      output.push(
        (parseInt(chr, 16) << 4) + parseInt(chr2, 16)
      )
    } else if (chr === '.') {
      // 8-bit Integer
      let digits = ''

      while (digits.length < 4) {
        const chr2 = input[++i]
        // FIXME: handle EOF better?
        if (chr2 && (isDecimalChar(chr2) || chr2 === '-')) {
          digits += chr2
        } else {
          i--
          break
        }
      }

      if (digits.length < 1 || digits.length > 4) {
        throw new Error('invalid integer: ' + digits)
      } else {
        output.push(parseInt(digits) & 0xff)
      }
    } else if (chr === '"') {
      while (true) {
        const chr2 = input[++i]
        if (chr2 === undefined || chr2 === '"') {
          break
        } else if (chr2 === '\\') {
          const chr3 = input[++i]
          const escaped = escapeToHex(chr3)
          if (escaped === undefined) {
            throw new Error('invalid escape sequence: ', chr3)
          } else {
            output.push(escaped)
          }
        } else {
          output.push(chr2.charCodeAt(0))
        }
      }
    } else if (chr === '\\') {
      const chr2 = input[++i]
      if (chr2 === undefined) {
        break
      } else {
        const escaped = escapeToHex(chr2)
        if (escaped === undefined) {
          throw new Error('invalid escape sequence: ', chr2)
        } else {
          output.push(escaped)
        }
      }
    } else {
      throw new Error('unrecognised character in input: ', chr)
    }
  }

  return output
}

function parseToHex (input, separator) {
  const array = parse(input)
  
  if (separator === undefined) {
      separator = ' '
  }

  return array.map(i => i.toString(16).padStart(2, '0')).join(separator)
}

module.exports = {
  parse,
  parseToHex
}
