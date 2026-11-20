import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { AddressInfo } from 'node:net'
import type { ApiRequest } from '../shared/http.ts'
import { createUsersServer } from './server.ts'
import { createUsersApi, HOBBIES_CACHE_CONTROL, type UsersApi } from './users-api.ts'

let api: UsersApi
const call = (method: string, path: string, body?: unknown) =>
  api.handle({ method, path, body } satisfies ApiRequest)

/** The `data` of a successful response. */
const data = (response: { body?: unknown }) => (response.body as { data: unknown }).data
const error = (response: { body?: unknown }) =>
  (response.body as { error: { message: string } }).error.message

beforeEach(() => {
  api = createUsersApi()
})

describe('users', () => {
  it('lists the users without hobbies, with links', () => {
    const response = call('GET', '/users')
    const [batman] = data(response) as Record<string, unknown>[]

    expect(response.status).toBe(200)
    expect(batman).toEqual({
      id: 1,
      name: 'Batman',
      email: 'b-man@email.com',
      links: { self: '/users/1', hobbies: '/users/1/hobbies' },
    })
  })

  it('creates a user with the next free id, even after a delete', () => {
    call('DELETE', '/users/8')
    const response = call('POST', '/users', { name: 'Storm', email: 'storm@email.com' })

    expect(response.status).toBe(201)
    expect(response.headers?.Location).toBe('/users/8')
    expect(data(call('GET', '/users/8'))).toMatchObject({ name: 'Storm' })
    expect(data(call('GET', '/users/7'))).toMatchObject({ name: 'Hulk' })
  })

  it('validates the new user', () => {
    expect(call('POST', '/users', { name: 'No email' }).status).toBe(400)
    expect(error(call('POST', '/users', { name: 'X', email: 'not-an-email' }))).toContain('email')
    expect(call('POST', '/users', { name: 'X', email: 'x@email.com', hobbies: 'one' }).status).toBe(
      400,
    )
    expect(call('POST', '/users', [1, 2]).status).toBe(400)
  })

  it('does not allow the same email twice', () => {
    expect(call('POST', '/users', { name: 'Bruce', email: 'B-MAN@email.com' }).status).toBe(409)
    expect(call('PATCH', '/users/2', { email: 'b-man@email.com' }).status).toBe(409)
  })

  it('changes the name or the email', () => {
    const response = call('PATCH', '/users/4', { name: 'Wade' })
    expect(response.status).toBe(200)
    expect(data(response)).toMatchObject({ id: 4, name: 'Wade', email: 'i_luv_logan@email.com' })
    expect(call('PATCH', '/users/4', {}).status).toBe(400)
  })

  it('deletes a user', () => {
    expect(call('DELETE', '/users/3').status).toBe(200)
    expect(call('GET', '/users/3').status).toBe(404)
    expect(call('DELETE', '/users/3').status).toBe(404)
  })

  it('answers 404 for unknown users and paths', () => {
    expect(error(call('GET', '/users/99'))).toBe('User 99 not found')
    expect(call('GET', '/users/abc').status).toBe(404)
    expect(call('GET', '/nothing-here').status).toBe(404)
  })
})

describe('hobbies', () => {
  it('lists the hobbies with a Cache-Control header', () => {
    const response = call('GET', '/users/2/hobbies')
    expect(data(response)).toMatchObject({ hobbies: ['laser', 'flying', 'journalism', 'x-ray'] })
    expect(response.headers?.['Cache-Control']).toBe(HOBBIES_CACHE_CONTROL)
  })

  it('adds hobbies without duplicates', () => {
    const response = call('POST', '/users/4/hobbies', { hobbies: ['music', 'chimichangas'] })
    expect(data(response)).toMatchObject({
      hobbies: ['music', 'dancing', 'drawing', 'chimichangas'],
    })
    expect(call('POST', '/users/4/hobbies', { hobbies: [] }).status).toBe(400)
  })

  it('removes one hobby, also with a space in its name', () => {
    const response = call('DELETE', '/users/1/hobbies/close%20combat')
    expect(data(response)).toMatchObject({
      hobbies: ['climbing', 'money spending', 'slapping Robin'],
    })
    expect(call('DELETE', '/users/1/hobbies/knitting').status).toBe(404)
  })
})

describe('methods', () => {
  it('lists the allowed methods for OPTIONS', () => {
    const response = call('OPTIONS', '/users')
    expect(response.status).toBe(204)
    expect(response.headers?.Allow).toBe('GET, POST, OPTIONS')
  })

  it('answers 405 for a known path with another method', () => {
    const response = call('PUT', '/users/1/hobbies')
    expect(response.status).toBe(405)
    expect(response.headers?.Allow).toBe('GET, POST, OPTIONS')
  })
})

describe('on node:http', () => {
  const server = createUsersServer()
  let base = ''

  beforeAll(async () => {
    await new Promise<void>((resolve) => server.listen(0, resolve))
    base = `http://localhost:${(server.address() as AddressInfo).port}`
  })
  afterAll(() => {
    server.close()
  })

  it('answers with JSON', async () => {
    const response = await fetch(`${base}/users/1?ignored=query`)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(((await response.json()) as { data: { name: string } }).data.name).toBe('Batman')
  })

  it('reads a JSON body', async () => {
    const response = await fetch(`${base}/users`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Rogue', email: 'rogue@email.com', hobbies: ['flying'] }),
    })
    expect(response.status).toBe(201)
  })

  it('answers 400 for a body that is not JSON', async () => {
    const response = await fetch(`${base}/users`, { method: 'POST', body: '{ oops' })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      data: null,
      error: { message: 'The body is not valid JSON' },
    })
  })
})
