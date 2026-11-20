import { describe, expect, it } from 'bun:test'
import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import { text } from 'node:stream/consumers'
import { fileURLToPath } from 'node:url'
import { csvToJsonLines, parseCsvLine, toValue } from './csv.ts'
import { CsvToJsonLines } from './csv-stream.ts'

const BOOKS = fileURLToPath(new URL('./books.csv', import.meta.url))

describe('parseCsvLine', () => {
  it('splits plain fields', () => {
    expect(parseCsvLine('a,b , c')).toEqual(['a', 'b', 'c'])
  })

  it('keeps commas and quotes inside quoted fields', () => {
    expect(parseCsvLine('"Influence: The Psychology, of Persuasion","He said ""hi""",3')).toEqual([
      'Influence: The Psychology, of Persuasion',
      'He said "hi"',
      '3',
    ])
  })

  it('handles empty fields and other delimiters', () => {
    expect(parseCsvLine('a,,c')).toEqual(['a', '', 'c'])
    expect(parseCsvLine('a;b', ';')).toEqual(['a', 'b'])
  })
})

describe('toValue', () => {
  it('turns numbers into numbers and leaves the rest', () => {
    expect(toValue('9.48')).toBe(9.48)
    expect(toValue('-3')).toBe(-3)
    expect(toValue('007 James')).toBe('007 James')
    expect(toValue('')).toBe('')
  })
})

describe('csvToJsonLines', () => {
  it('writes one JSON object per line, without the omitted column, BOM and CRLF included', () => {
    const csv = '﻿Book,Author,Amount,Price\r\nThe ONE Thing,Gary Keller,1,11.18\r\n\r\n'
    expect(csvToJsonLines(csv, { omit: ['Amount'] })).toBe(
      '{"Book":"The ONE Thing","Author":"Gary Keller","Price":11.18}\n',
    )
  })
})

describe('CsvToJsonLines stream', () => {
  it('gives the same result as the text version for books.csv', async () => {
    const streamed = await text(
      createReadStream(BOOKS, { highWaterMark: 16 }).pipe(new CsvToJsonLines({ omit: ['Amount'] })),
    )
    const whole = csvToJsonLines(await Bun.file(BOOKS).text(), { omit: ['Amount'] })

    expect(streamed).toBe(whole)
    expect(streamed.trim().split('\n')).toHaveLength(5)
  })

  it('copes with a multi-byte character split between two chunks', async () => {
    const bytes = Buffer.from('Name\nKarácsony\n')
    const cut = bytes.indexOf(0xa1) // the second byte of "á"
    const source = Readable.from([bytes.subarray(0, cut), bytes.subarray(cut)])

    expect(await text(source.pipe(new CsvToJsonLines()))).toBe('{"Name":"Karácsony"}\n')
  })

  it('writes the last line even without a closing newline', async () => {
    const source = Readable.from(['a,b\n1,', '2'])
    expect(await text(source.pipe(new CsvToJsonLines()))).toBe('{"a":1,"b":2}\n')
  })
})
