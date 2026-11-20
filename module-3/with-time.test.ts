import { describe, expect, it, mock } from 'bun:test'
import { fetchPost, WithTime } from './with-time.ts'

describe('WithTime', () => {
  it('emits begin, end with the elapsed time, then data', async () => {
    const withTime = new WithTime<string>()
    const events: string[] = []
    withTime.on('begin', () => events.push('begin'))
    withTime.on('end', (ms) => events.push(`end ${typeof ms}`))
    withTime.on('data', (result) => events.push(`data ${result}`))

    const result = await withTime.execute(async (a: number, b: number) => `${a + b}`, 2, 3)

    expect(result).toBe('5')
    expect(events).toEqual(['begin', 'end number', 'data 5'])
  })

  it('emits error and rejects when the function fails', async () => {
    const withTime = new WithTime()
    const onError = mock()
    withTime.on('error', onError)

    await expect(
      withTime.execute(async () => {
        throw new Error('nope')
      }),
    ).rejects.toThrow('nope')
    expect(onError).toHaveBeenCalledWith(new Error('nope'))
  })
})

describe('fetchPost', () => {
  it('loads a post', async () => {
    const post = { userId: 1, id: 3, title: 'title', body: 'body' }
    const fetchFn = mock(async () => Response.json(post))

    expect(await fetchPost(3, fetchFn as unknown as typeof fetch)).toEqual(post)
    expect(fetchFn).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/3')
  })

  it('fails on an error status', async () => {
    const fetchFn = mock(async () => new Response('{}', { status: 404 }))
    await expect(fetchPost(999, fetchFn as unknown as typeof fetch)).rejects.toThrow('(404)')
  })
})
