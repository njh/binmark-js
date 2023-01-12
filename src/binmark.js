
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

function parseComment (input, state) {
  while (true) {
    const chr = input[state.pos++]
    if (chr === undefined || chr === '\n' || chr === '\r') { return }
  }
}

function parseHexValue (chr, input, state) {
  const chr2 = input[state.pos++]
  if (!isHexChar(chr2)) {
    throw new Error('got non-hex digit after hex digit: ' + chr2)
  }

  return (parseInt(chr, 16) << 4) + parseInt(chr2, 16)
}

function parseDecInteger (input, state) {
  let digits = ''

  while (digits.length < 4) {
    const chr = input[state.pos++]
    // FIXME: handle EOF better?
    if (chr && (isDecimalChar(chr) || chr === '-')) {
      digits += chr
    } else {
      state.pos--
      break
    }
  }

  if (digits.length < 1 || digits.length > 4) {
    throw new Error('invalid integer: ' + digits)
  } else {
    return parseInt(digits) & 0xff
  }
}

function parseEscape (input, state) {
  const chr = input[state.pos++]
  if (chr === undefined) {
    // FIXME

  } else {
    const escaped = escapeToHex(chr)
    if (escaped === undefined) {
      throw new Error('invalid escape sequence: ' + chr)
    } else {
      return escaped
    }
  }
}

function parseString (input, state) {
  const output = []

  while (true) {
    const chr = input[state.pos++]
    if (chr === undefined || chr === '"') {
      break
    } else if (chr === '\\') {
      output.push(parseEscape(input, state))
    } else {
      output.push(chr.charCodeAt(0))
    }
  }

  return output
}

function parse (input) {
  const output = []
  const state = {
    pos: 0,
    line: 1
  }

  while (state.pos < input.length) {
    const chr = input[state.pos++]

    if (isSpace(chr) || chr === ':' || chr === '-') {
      // Ignore
    } else if (chr === '#') {
      // Ignore the rest of the line
      parseComment(input, state)
    } else if (isHexChar(chr)) {
      // Hex
      output.push(parseHexValue(chr, input, state))
    } else if (chr === '.') {
      // 8-bit Decimal Integer
      output.push(parseDecInteger(input, state))
    } else if (chr === '"') {
      // String
      Array.prototype.push.apply(output, parseString(input, state))
    } else if (chr === '\\') {
      // Escape
      output.push(parseEscape(input, state))
    } else {
      throw new Error('unrecognised character in input: ' + chr)
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

function parseToCommaHex (input) {
  const array = parse(input)

  return array.map(i => '0x' + i.toString(16).padStart(2, '0')).join(', ')
}

module.exports = {
  parse,
  parseToHex,
  parseToCommaHex
}
