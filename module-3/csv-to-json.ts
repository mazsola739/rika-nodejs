/**
 * Module 3 – streams: reads books.csv and writes books.txt, one JSON object per line,
 * without the Amount column. Nothing is loaded into memory as a whole.
 * Run: bun run module-3:csv
 */
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { CsvToJsonLines } from './csv-stream.ts'

const input = fileURLToPath(new URL('./books.csv', import.meta.url))
const output = fileURLToPath(new URL('./books.txt', import.meta.url))

try {
  await pipeline(
    createReadStream(input),
    new CsvToJsonLines({ omit: ['Amount'] }),
    createWriteStream(output),
  )
  console.log(`CSV converted to JSON lines: ${output}`)
} catch (error) {
  console.error(`Could not convert the CSV: ${(error as Error).message}`)
  process.exitCode = 1
}
