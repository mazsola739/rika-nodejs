import { type FormEvent, useState } from 'react'
import type { ApiRequest, ApiResponse } from '../../shared/http.ts'
import { Button, Card, cx, DemoTitle, Terminal } from '../components/ui.tsx'

export type Example = {
  label: string
  method: string
  path: string
  body?: unknown
  /** For the checkout API: which x-user-id to send ('' = no header). */
  user?: string
}

export type RouteDoc = { method: string; path: string; summary: string }

const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  418: "I'm a teapot",
  500: 'Internal Server Error',
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

type Props = {
  title: string
  note: string
  /** Sends one request to the API that runs in this tab. */
  send: (request: ApiRequest) => ApiResponse
  reset: () => void
  routes: RouteDoc[]
  examples: Example[]
  /** The x-user-id choices; without it the console sends no such header. */
  users?: { label: string; value: string }[]
}

type Exchange = { request: ApiRequest; response: ApiResponse; ms: number }

/** A tiny Postman: pick an example or write a request, send it, read the answer. */
export const ApiConsole = ({ title, note, send, reset, routes, examples, users }: Props) => {
  const first = examples[0] as Example
  const [method, setMethod] = useState(first.method)
  const [path, setPath] = useState(first.path)
  const [body, setBody] = useState('')
  const [user, setUser] = useState(first.user ?? users?.[0]?.value ?? '')
  const [exchange, setExchange] = useState<Exchange | null>(null)

  const load = (example: Example) => {
    setMethod(example.method)
    setPath(example.path)
    setBody(example.body === undefined ? '' : JSON.stringify(example.body, null, 2))
    if (example.user !== undefined) setUser(example.user)
    run(example.method, example.path, example.body, example.user ?? user)
  }

  const run = (method: string, path: string, parsedBody: unknown, user: string) => {
    const request: ApiRequest = {
      method,
      path: path.split('?')[0] || '/',
      headers: users && user ? { 'x-user-id': user } : {},
      body: parsedBody,
    }
    const start = performance.now()
    const response = send(request)
    setExchange({ request, response, ms: performance.now() - start })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    let parsed: unknown
    if (body.trim()) {
      try {
        parsed = JSON.parse(body)
      } catch {
        const request = { method, path, body }
        const response = {
          status: 400,
          body: { data: null, error: { message: 'The body is not valid JSON' } },
        }
        return setExchange({ request, response, ms: 0 })
      }
    }
    run(method, path, parsed, user)
  }

  const response = exchange?.response
  const isHtml = typeof response?.body === 'string'

  return (
    <Card>
      <DemoTitle note={note}>{title}</DemoTitle>

      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Example requests</legend>
        {examples.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => load(example)}
            className="rounded-full border border-line px-2.5 py-0.5 text-xs hover:border-accent hover:text-accent"
          >
            {example.label}
          </button>
        ))}
      </fieldset>

      <form onSubmit={submit} className="mt-3 space-y-2">
        <div className="flex gap-2">
          <label className="sr-only" htmlFor={`${title}-method`}>
            Method
          </label>
          <select
            id={`${title}-method`}
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className="rounded-md border border-line bg-page px-2 font-mono text-sm"
          >
            {METHODS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${title}-path`}>
            Path
          </label>
          <input
            id={`${title}-path`}
            value={path}
            onChange={(event) => setPath(event.target.value)}
            spellCheck={false}
            className="min-w-0 flex-1 rounded-md border border-line bg-page px-2 py-1.5 font-mono text-sm"
          />
          <Button type="submit" variant="primary">
            Send
          </Button>
        </div>

        {users && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label htmlFor={`${title}-user`} className="font-mono text-muted">
              x-user-id:
            </label>
            <select
              id={`${title}-user`}
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="max-w-full min-w-0 rounded-md border border-line bg-page px-2 py-1 font-mono text-xs"
            >
              {users.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <label htmlFor={`${title}-body`} className="sr-only">
          JSON body
        </label>
        <textarea
          id={`${title}-body`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={body ? Math.min(8, body.split('\n').length + 1) : 2}
          placeholder="JSON body (optional)"
          spellCheck={false}
          className="w-full resize-y rounded-md border border-line bg-page p-2 font-mono text-[12px]"
        />
      </form>

      <Terminal title="response" className="mt-2">
        <div className="max-h-80 overflow-auto px-4 py-3" aria-live="polite">
          {!exchange || !response ? (
            <p className="text-term-muted">Pick an example or send a request.</p>
          ) : (
            <>
              <p>
                <span className="text-term-muted">
                  {exchange.request.method} {exchange.request.path} →{' '}
                </span>
                <span
                  className={cx(
                    'font-semibold',
                    response.status < 300
                      ? 'text-term-green'
                      : response.status < 500
                        ? 'text-term-yellow'
                        : 'text-term-red',
                  )}
                >
                  {response.status} {STATUS_TEXT[response.status] ?? ''}
                </span>
                <span className="text-term-muted">
                  {' '}
                  · {exchange.ms < 1 ? '<1' : exchange.ms.toFixed(0)} ms
                </span>
              </p>
              {Object.entries(response.headers ?? {}).map(([name, value]) => (
                <p key={name} className="text-term-blue">
                  {name}: {value}
                </p>
              ))}
              {response.body !== undefined &&
                (isHtml ? (
                  <iframe
                    title="The HTML answer"
                    srcDoc={response.body as string}
                    sandbox=""
                    className="mt-2 h-56 w-full rounded bg-white"
                  />
                ) : (
                  <pre className="mt-2 text-term-ink">{JSON.stringify(response.body, null, 2)}</pre>
                ))}
            </>
          )}
        </div>
      </Terminal>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
        <details className="min-w-0 flex-1 text-sm">
          <summary className="cursor-pointer text-muted hover:text-accent">All endpoints</summary>
          <ul className="mt-2 space-y-1">
            {routes.map((route) => (
              <li key={`${route.method} ${route.path}`} className="flex flex-wrap gap-x-2">
                <code className="w-14 shrink-0 font-mono text-xs leading-5 text-accent">
                  {route.method}
                </code>
                <code className="font-mono text-xs leading-5">{route.path}</code>
                <span className="text-xs leading-5 text-muted">{route.summary}</span>
              </li>
            ))}
          </ul>
        </details>
        <Button
          variant="ghost"
          onClick={() => {
            reset()
            setExchange(null)
          }}
        >
          Reset the data
        </Button>
      </div>
    </Card>
  )
}
