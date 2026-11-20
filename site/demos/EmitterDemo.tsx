import { useRef, useState } from 'react'
import { EventEmitter } from '../../module-3/event-emitter.ts'
import { Button, Card, DemoTitle, Terminal } from '../components/ui.tsx'

type Entry = { id: number; text: string; tone: 'call' | 'info' | 'muted' }

export const EmitterDemo = () => {
  const emitter = useRef(new EventEmitter<{ ping: [count: number] }>())
  const added = useRef<((count: number) => void)[]>([])
  const nextId = useRef(1)
  const pings = useRef(0)
  const [log, setLog] = useState<Entry[]>([])
  const [, refresh] = useState(0)

  const write = (text: string, tone: Entry['tone'] = 'info') => {
    setLog((old) => [...old, { id: nextId.current++, text, tone }].slice(-40))
    refresh((n) => n + 1)
  }

  const add = (once: boolean) => {
    const number = added.current.length + 1
    const listener = (count: number) =>
      write(`  listener ${number}${once ? ' (once)' : ''} got ping #${count}`, 'call')
    added.current.push(listener)
    if (once) emitter.current.once('ping', listener)
    else emitter.current.on('ping', listener)
    write(`emitter.${once ? 'once' : 'on'}('ping', listener${number})`)
  }

  const emit = () => {
    pings.current += 1
    write(`emitter.emit('ping', ${pings.current})`)
    const heard = emitter.current.emit('ping', pings.current)
    if (!heard) write('  → false: nobody is listening', 'muted')
  }

  const removeLast = () => {
    const listener = emitter.current.listeners('ping').at(-1)
    if (!listener) return write('nothing to remove', 'muted')
    emitter.current.off('ping', listener)
    write(`emitter.off('ping', listener${added.current.indexOf(listener) + 1})`)
  }

  const count = emitter.current.listenerCount('ping')

  return (
    <Card>
      <DemoTitle note="Add listeners, then emit. A once listener leaves after its first ping – and, unlike in my 2023 version, it no longer makes the next listener miss its turn.">
        My EventEmitter
      </DemoTitle>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => add(false)}>+ on</Button>
        <Button onClick={() => add(true)}>+ once</Button>
        <Button variant="primary" onClick={emit}>
          emit('ping')
        </Button>
        <Button onClick={removeLast} disabled={count === 0}>
          off (last)
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            emitter.current.removeAllListeners()
            write('emitter.removeAllListeners()')
          }}
        >
          remove all
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted" aria-live="polite">
        listenerCount('ping') = <strong className="font-mono text-ink">{count}</strong>
      </p>
      <Terminal title="events" className="mt-2">
        <div className="h-44 overflow-y-auto px-4 py-3">
          {log.length === 0 && <p className="text-term-muted">Add a listener, then emit a ping.</p>}
          {log.map((entry) => (
            <pre
              key={entry.id}
              className={
                entry.tone === 'call'
                  ? 'text-term-green'
                  : entry.tone === 'muted'
                    ? 'text-term-muted'
                    : 'text-term-ink'
              }
            >
              {entry.text}
            </pre>
          ))}
        </div>
      </Terminal>
    </Card>
  )
}
