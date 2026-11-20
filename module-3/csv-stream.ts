import { Transform, type TransformCallback } from 'node:stream'
import { StringDecoder } from 'node:string_decoder'
import { type CsvOptions, CsvRowReader } from './csv.ts'

/**
 * A Transform stream: CSV text in, one JSON object per line out. Chunks can end in the middle of
 * a line (or of a multi-byte character), so the unfinished part waits for the next chunk.
 */
export class CsvToJsonLines extends Transform {
  readonly #reader: CsvRowReader
  readonly #decoder = new StringDecoder('utf8')
  #rest = ''

  constructor(options?: CsvOptions) {
    super()
    this.#reader = new CsvRowReader(options)
  }

  override _transform(chunk: Buffer | string, _encoding: BufferEncoding, done: TransformCallback) {
    const text = this.#rest + (typeof chunk === 'string' ? chunk : this.#decoder.write(chunk))
    const lines = text.split('\n')
    this.#rest = lines.pop() ?? ''
    for (const line of lines) this.#pushLine(line)
    done()
  }

  override _flush(done: TransformCallback) {
    this.#pushLine(this.#rest + this.#decoder.end())
    done()
  }

  #pushLine(line: string) {
    const row = this.#reader.read(line)
    if (row) this.push(`${JSON.stringify(row)}\n`)
  }
}
