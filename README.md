binmark.js
==========

[![CI](https://github.com/njh/binmark-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/njh/binmark-js/actions/workflows/ci.yml)

_binmark_ is a markup language and TypeScript / JavaScript library for describing
binary files, that is easier to read and write than a continuous stream of
hexadecimal characters.


The following characters are supported:

| Character     | Description                                                    |
|---------------|----------------------------------------------------------------|
| 0-9 and a-f   | A byte as hexadecimal. Must be two characters long.            |
| Whitespace    | Ignored                                                        |
| Colon or Dash | Ignored - useful for improving readability                     |
| .nnn          | A 8-bit decimal integer                                        |
| ""            | A string of ASCII characters                                   |
| #             | The start of a comment - the rest of the line is ignored       |
| \             | Escape sequences (\0 \a \b \f \n \r \t \v and octal like \043) |


Example
-------

Given the following sample input file, which is reasonably easy read:

    30             # Packet Type 3: Publish
    .17            # Remaining length (17 bytes)
    0004           # Topic name length
    "test"         # Topic name
    "hello world"  # Payload

The resulting hexadecimal would be:

    30 11 00 04 74 65 73 74
    68 65 6c 6c 6f 20 77 6f
    72 6c 64


API
---

`parse(input: string): number[]`  
Parses binmark text and returns the output as an array of byte values (`0-255`).

`parseToHex(input: string, separator?: string): string`  
Parses binmark text and returns lowercase hexadecimal bytes as a string joined by `separator` (default: a space).

`parseToCommaHex(input: string): string`  
Parses binmark text and returns a comma-separated hex list as a string like `0x30, 0x11, 0x00`.

`parseToBuffer(input: string): Buffer`  
Parses binmark text and returns a Node.js `Buffer`.

Default export: `parse`.


But why?
--------

I created _binmark_ after my test cases, when writing test cases for my Arduino IPv6 Library,
EtherSia, started resulting in long strings of hexadecimal characters in my code. I 
decided that these would be better in seperate external files and realised that I had the 
freedom to decide on the file format, to make them easier to read and write.

A long stream of hexadecimal is difficult to both read and write - particularly picking 
out the different fields and sections. By adding some whitespace, punctuation and 
comments, it is much easier.

Possible uses:

* Describing expected data for automated tests
* Creating new file formats before tools to generate them exist
* Documenting a data structure in a human readable way
* Alternative to a using a hex editor


Design Decisions
----------------

This was my thought process while designing _binmark_:

* Readable and concise to write for humans
* Simple for a machine to parse and convert
* Streamable - don't require input to be loaded into a buffer more parsing
* ASCII input - try and avoid potential weird character-set problems
* Not so complex that there wouldn't be other implementations in other languages


Other Languages
---------------

* C/C++: https://github.com/njh/binmark


License
-------

`binmark` is licensed under the terms of the MIT license.
See the file [LICENSE](/LICENSE.md) for details.


Contact
-------

* Author:    Nicholas J Humfrey
* Twitter:   [@njh](http://twitter.com/njh)
