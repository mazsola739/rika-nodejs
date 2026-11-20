/**
 * Module 3 – CSV to JSON, without a CSV library. The parser works line by line, so the same code
 * runs in a Node stream (csv-stream.ts) and on a whole text in the browser.
 */

export type CsvRow = Record<string, string | number>

export type CsvOptions = {
  /** Columns to leave out of the JSON, e.g. `['Amount']`. */
  omit?: string[]
  delimiter?: string
}

/** Splits one CSV line into fields. Quoted fields can hold the delimiter and `""` quotes. */
export const parseCsvLine = (line: string, delimiter = ','): string[] => {
  const fields: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === delimiter) {
      fields.push(field)
      field = ''
    } else field += char
  }

  fields.push(field)
  return fields.map((value) => value.trim())
}

/** `'9.48'` → 9.48; everything else stays text. */
export const toValue = (raw: string): string | number =>
  raw !== '' && /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw

/**
 * Turns lines into rows: the first non-empty line is the header. Keeps its state between calls,
 * so a stream can feed it one line at a time.
 */
export class CsvRowReader {
  #headers: string[] | null = null
  readonly #omit: Set<string>
  readonly #delimiter: string

  constructor({ omit = [], delimiter = ',' }: CsvOptions = {}) {
    this.#omit = new Set(omit)
    this.#delimiter = delimiter
  }

  /** Returns the row, or null for the header line and empty lines. */
  read(line: string): CsvRow | null {
    const clean = line.replace(/^﻿/, '').replace(/\r$/, '')
    if (clean.trim() === '') return null

    const values = parseCsvLine(clean, this.#delimiter)
    if (!this.#headers) {
      this.#headers = values
      return null
    }

    const row: CsvRow = {}
    for (const [index, header] of this.#headers.entries()) {
      if (!this.#omit.has(header)) row[header] = toValue(values[index] ?? '')
    }
    return row
  }
}

/** A whole CSV text → one JSON object per line (the format of the output .txt file). */
export const csvToJsonLines = (text: string, options?: CsvOptions): string => {
  const reader = new CsvRowReader(options)
  return text
    .split('\n')
    .map((line) => reader.read(line))
    .filter((row) => row !== null)
    .map((row) => `${JSON.stringify(row)}\n`)
    .join('')
}
