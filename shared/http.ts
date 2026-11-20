/**
 * A small, framework-free description of an HTTP exchange. The handlers of module 5 and 6 take an
 * `ApiRequest` and return an `ApiResponse`, so the same code answers in node:http, in Express and
 * in the browser console of the project page.
 */
export type ApiRequest = {
  method: string
  /** Path without the query string, e.g. `/users/3/hobbies`. */
  path: string
  headers?: Record<string, string | undefined>
  body?: unknown
}

export type ApiResponse = {
  status: number
  body?: unknown
  headers?: Record<string, string>
}

/** The envelope every JSON response uses: `{ data, error }`. */
export type Envelope<T> = { data: T; error: null } | { data: null; error: { message: string } }

export const ok = <T>(data: T, status = 200, headers?: Record<string, string>): ApiResponse => ({
  status,
  body: { data, error: null } satisfies Envelope<T>,
  ...(headers && { headers }),
})

export const fail = (status: number, message: string): ApiResponse => ({
  status,
  body: { data: null, error: { message } } satisfies Envelope<never>,
})

export type Params = Record<string, string>

/**
 * Matches a path against a pattern with `:named` segments.
 * `matchPath('/users/:id', '/users/7')` → `{ id: '7' }`, no match → `null`.
 */
export const matchPath = (pattern: string, path: string): Params | null => {
  const expected = pattern.split('/').filter(Boolean)
  const actual = path.split('/').filter(Boolean)
  if (expected.length !== actual.length) return null

  const params: Params = {}
  for (const [index, segment] of expected.entries()) {
    const value = actual[index] as string
    if (segment.startsWith(':')) params[segment.slice(1)] = decodeURIComponent(value)
    else if (segment !== value) return null
  }
  return params
}

/** Header lookup that ignores case, like Node does. */
export const header = (request: ApiRequest, name: string): string | undefined => {
  const wanted = name.toLowerCase()
  const entry = Object.entries(request.headers ?? {}).find(([key]) => key.toLowerCase() === wanted)
  return entry?.[1] || undefined
}
