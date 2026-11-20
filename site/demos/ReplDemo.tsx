import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { describeRandom, HELP, random } from '../../module-1/random.ts'
import { Terminal } from '../components/ui.tsx'

type Line = { kind: 'in' | 'out' | 'error'; text: string }

const COMMANDS = [
  '.clear    Clear the screen',
  '.help     Print this help message',
  `.random   ${HELP}`,
].join('\n')

/** What the REPL answers. Only the commands work here – the real REPL also runs JavaScript. */
const answer = (input: string): Line | 'clear' | null => {
  const [command = '', ...rest] = input.trim().split(/\s+/)
  if (command === '') return null
  if (command === '.random') return { kind: 'out', text: describeRandom(random(rest.join(' '))) }
  if (command === '.help') return { kind: 'out', text: COMMANDS }
  if (command === '.clear') return 'clear'
  return {
    kind: 'error',
    text: 'On this page only .random, .help and .clear work – the real REPL (bun run module-1) runs any JavaScript too.',
  }
}

export const ReplDemo = () => {
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: HELP }])
  const [input, setInput] = useState('.random 1 100')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const screen = useRef<HTMLDivElement>(null)

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight })
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = answer(input)
    if (input.trim()) setHistory((old) => [input, ...old].slice(0, 30))
    setCursor(-1)
    setInput('')

    if (result === 'clear') return setLines([])
    const added: Line[] = [{ kind: 'in', text: input }, ...(result ? [result] : [])]
    setLines((old) => [...old, ...added].slice(-60))
  }

  // Up and down walk through the earlier commands, like in a real terminal.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const next = Math.max(
      -1,
      Math.min(history.length - 1, cursor + (event.key === 'ArrowUp' ? 1 : -1)),
    )
    setCursor(next)
    setInput(next === -1 ? '' : (history[next] ?? ''))
  }

  return (
    <Terminal title="node:repl">
      <div ref={screen} className="h-56 overflow-y-auto px-4 py-3" aria-live="polite">
        {lines.map((line, index) => (
          <pre
            // biome-ignore lint/suspicious/noArrayIndexKey: the lines never move, only new ones are added
            key={index}
            className={
              line.kind === 'in'
                ? 'whitespace-pre-wrap text-term-ink'
                : line.kind === 'error'
                  ? 'whitespace-pre-wrap text-term-red'
                  : 'whitespace-pre-wrap text-term-green'
            }
          >
            {line.kind === 'in' ? `> ${line.text}` : line.text}
          </pre>
        ))}
      </div>
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-term-line px-4 py-2"
      >
        <span aria-hidden="true" className="text-term-yellow">
          &gt;
        </span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label="REPL command, for example .random 1 100"
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-term-ink outline-none placeholder:text-term-muted"
          placeholder=".random 1 100"
        />
        <button type="submit" className="text-xs text-term-muted hover:text-term-green">
          Enter ↵
        </button>
      </form>
    </Terminal>
  )
}
