import { EventEmitter } from './event-emitter.ts'

export type WithTimeEvents<T> = {
  begin: []
  end: [ms: number]
  data: [result: T]
  error: [error: Error]
}

/**
 * Runs an async function and tells about it with events:
 * `begin` → `end` (with the elapsed milliseconds) → `data` (with the result), or `error`.
 */
export class WithTime<T = unknown> extends EventEmitter<WithTimeEvents<T>> {
  async execute<Args extends unknown[]>(
    asyncFn: (...args: Args) => Promise<T>,
    ...args: Args
  ): Promise<T> {
    this.emit('begin')
    const start = performance.now()

    try {
      const result = await asyncFn(...args)
      this.emit('end', Math.round(performance.now() - start))
      this.emit('data', result)
      return result
    } catch (error) {
      this.emit('end', Math.round(performance.now() - start))
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }
}

export type Post = { userId: number; id: number; title: string; body: string }

/** The async function of the demo: one post from the JSONPlaceholder fake API. */
export const fetchPost = async (id: number, fetchFn: typeof fetch = fetch): Promise<Post> => {
  const response = await fetchFn(`https://jsonplaceholder.typicode.com/posts/${id}`)
  if (!response.ok) throw new Error(`Post ${id} could not be loaded (${response.status})`)
  return response.json() as Promise<Post>
}
