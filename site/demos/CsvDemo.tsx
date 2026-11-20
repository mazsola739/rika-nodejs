import { useMemo, useState } from 'react'
import books from '../../module-3/books.csv?raw'
import { csvToJsonLines, parseCsvLine } from '../../module-3/csv.ts'
import { Card, DemoTitle, Terminal } from '../components/ui.tsx'

export const CsvDemo = () => {
  const [csv, setCsv] = useState(books.replace(/^﻿/, ''))
  const [omit, setOmit] = useState<string[]>(['Amount'])

  const headers = useMemo(() => {
    const first = csv.split('\n').find((line) => line.trim() !== '')
    return first ? parseCsvLine(first.replace(/\r$/, '')) : []
  }, [csv])
  const output = useMemo(() => csvToJsonLines(csv, { omit }), [csv, omit])

  const toggle = (column: string) =>
    setOmit((old) =>
      old.includes(column) ? old.filter((item) => item !== column) : [...old, column],
    )

  return (
    <Card>
      <DemoTitle note="In Node the file goes through a Transform stream chunk by chunk; here the same line parser reads the whole text. Edit the CSV – quoted fields with commas work too.">
        CSV to JSON lines
      </DemoTitle>

      <label htmlFor="csv-input" className="text-xs font-medium tracking-wide text-muted uppercase">
        books.csv
      </label>
      <textarea
        id="csv-input"
        value={csv}
        onChange={(event) => setCsv(event.target.value)}
        rows={7}
        spellCheck={false}
        className="mt-1 w-full resize-y rounded-md border border-line bg-page p-2 font-mono text-[12px]"
      />

      <fieldset className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <legend className="sr-only">Columns to leave out</legend>
        <span className="text-muted">Leave out:</span>
        {headers.map((column) => (
          <label key={column} className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={omit.includes(column)}
              onChange={() => toggle(column)}
              className="accent-(--accent)"
            />
            {column}
          </label>
        ))}
      </fieldset>

      <Terminal title="books.txt" className="mt-3">
        <pre className="max-h-56 overflow-auto px-4 py-3 text-term-green">
          {output || <span className="text-term-muted">No rows yet.</span>}
        </pre>
      </Terminal>
    </Card>
  )
}
