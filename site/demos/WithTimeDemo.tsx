import { useState } from 'react'
import { randomBetween } from '../../module-1/random.ts'
import { fetchPost, type Post, WithTime } from '../../module-3/with-time.ts'
import { Button, Card, DemoTitle, Terminal } from '../components/ui.tsx'

type Entry = { id: number; event: string; text: string }

export const WithTimeDemo = () => {
  const [log, setLog] = useState<Entry[]>([])
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setLog([])
    let id = 0
    const write = (event: string, text = '') => setLog((old) => [...old, { id: id++, event, text }])

    const withTime = new WithTime<Post>()
    withTime.on('begin', () => write('begin', 'About to execute'))
    withTime.on('end', (ms) => write('end', `Done with execute in ${ms} ms`))
    withTime.on('data', (post) => write('data', `post #${post.id}: “${post.title}”`))
    withTime.on('error', (error) => write('error', error.message))

    await withTime.execute(fetchPost, randomBetween(1, 100)).catch(() => {})
    setBusy(false)
  }

  return (
    <Card>
      <DemoTitle note="WithTime extends my EventEmitter: it runs an async function – here a request to the JSONPlaceholder fake API – and reports with events.">
        WithTime
      </DemoTitle>
      <Button variant="primary" onClick={run} disabled={busy}>
        {busy ? 'Fetching…' : 'Fetch a random post'}
      </Button>
      <Terminal title="with-time" className="mt-3">
        <div className="min-h-28 px-4 py-3" aria-live="polite">
          {log.length === 0 && <p className="text-term-muted">The events appear here.</p>}
          {log.map((entry) => (
            <p key={entry.id}>
              <span className={entry.event === 'error' ? 'text-term-red' : 'text-term-yellow'}>
                {`'${entry.event}'`.padEnd(8)}
              </span>{' '}
              <span className="text-term-ink">{entry.text}</span>
            </p>
          ))}
        </div>
      </Terminal>
    </Card>
  )
}
