/**
 * Module 5 – network: a REST API for users and their hobbies, without a framework.
 * The routes and handlers are plain functions (ApiRequest → ApiResponse); server.ts puts them on
 * node:http, and the project page runs the very same code in the browser.
 */
import {
  type ApiRequest,
  type ApiResponse,
  fail,
  matchPath,
  ok,
  type Params,
} from '../shared/http.ts'
import { createUsersRepository, type User, type UserFields } from './users-repository.ts'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'
type Handler = (input: { params: Params; body: unknown }) => ApiResponse
type Route = { method: Method; path: string; summary: string; handler: Handler }

/** Hobbies change rarely, so the browser may keep them for an hour. */
export const HOBBIES_CACHE_CONTROL = 'private, max-age=3600'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

/** Reads name and email from a body. `partial`: both are optional, but at least one is needed. */
const readUserFields = (
  body: unknown,
  partial: boolean,
): { fields: Partial<UserFields> } | { error: string } => {
  if (!isRecord(body)) return { error: 'The body must be a JSON object' }

  const fields: Partial<UserFields> = {}
  for (const key of ['name', 'email'] as const) {
    const value = body[key]
    if (value === undefined && partial) continue
    if (!isText(value)) return { error: `"${key}" must be a non-empty text` }
    fields[key] = value.trim()
  }

  if (fields.email !== undefined && !EMAIL.test(fields.email)) {
    return { error: '"email" must be a valid email address' }
  }
  if (partial && Object.keys(fields).length === 0) {
    return { error: 'Send "name" and/or "email" to change' }
  }
  return { fields }
}

const readHobbies = (value: unknown): string[] | null =>
  Array.isArray(value) && value.length > 0 && value.every(isText) ? value : null

export const createUsersApi = (repository = createUsersRepository()) => {
  const links = (id: number) => ({ self: `/users/${id}`, hobbies: `/users/${id}/hobbies` })

  /** A user without the hobbies, with links to itself and to the hobbies. */
  const view = ({ hobbies: _hobbies, ...user }: User) => ({ ...user, links: links(user.id) })
  const hobbiesView = (user: User) => ({ hobbies: user.hobbies, links: links(user.id) })

  const withUser = (params: Params, respond: (user: User) => ApiResponse): ApiResponse => {
    const user = /^\d+$/.test(params.id ?? '') ? repository.find(Number(params.id)) : undefined
    return user ? respond(user) : fail(404, `User ${params.id} not found`)
  }

  const emailTaken = (email: string | undefined, ownId?: number) => {
    const owner = email === undefined ? undefined : repository.findByEmail(email)
    return owner !== undefined && owner.id !== ownId
  }

  const routes: Route[] = [
    {
      method: 'GET',
      path: '/',
      summary: 'Is the server running?',
      handler: () => ok({ message: 'Server is running', links: { users: '/users' } }),
    },
    {
      method: 'GET',
      path: '/users',
      summary: 'All users, without their hobbies',
      handler: () => ok(repository.list().map(view)),
    },
    {
      method: 'POST',
      path: '/users',
      summary: 'Create a user: { name, email, hobbies? }',
      handler: ({ body }) => {
        const read = readUserFields(body, false)
        if ('error' in read) return fail(400, read.error)
        const hobbies =
          isRecord(body) && body.hobbies !== undefined ? readHobbies(body.hobbies) : []
        if (hobbies === null) return fail(400, '"hobbies" must be a list of texts')
        if (emailTaken(read.fields.email)) {
          return fail(409, `A user with the email ${read.fields.email} already exists`)
        }

        const user = repository.create(read.fields as UserFields, hobbies)
        return ok(view(user), 201, { Location: `/users/${user.id}` })
      },
    },
    {
      method: 'GET',
      path: '/users/:id',
      summary: 'One user, without the hobbies',
      handler: ({ params }) => withUser(params, (user) => ok(view(user))),
    },
    {
      method: 'PATCH',
      path: '/users/:id',
      summary: 'Change the name and/or the email',
      handler: ({ params, body }) =>
        withUser(params, (user) => {
          const read = readUserFields(body, true)
          if ('error' in read) return fail(400, read.error)
          if (emailTaken(read.fields.email, user.id)) {
            return fail(409, `A user with the email ${read.fields.email} already exists`)
          }
          return ok(view(repository.update(user.id, read.fields) as User))
        }),
    },
    {
      method: 'DELETE',
      path: '/users/:id',
      summary: 'Delete a user',
      handler: ({ params }) =>
        withUser(params, (user) => {
          repository.remove(user.id)
          return ok({ deleted: { id: user.id, name: user.name } })
        }),
    },
    {
      method: 'GET',
      path: '/users/:id/hobbies',
      summary: 'The hobbies of a user (cacheable)',
      handler: ({ params }) =>
        withUser(params, (user) =>
          ok(hobbiesView(user), 200, { 'Cache-Control': HOBBIES_CACHE_CONTROL }),
        ),
    },
    {
      method: 'POST',
      path: '/users/:id/hobbies',
      summary: 'Add hobbies: { hobbies: [...] }',
      handler: ({ params, body }) =>
        withUser(params, (user) => {
          const hobbies = isRecord(body) ? readHobbies(body.hobbies) : null
          if (!hobbies) return fail(400, 'Send { "hobbies": ["..."] } with at least one hobby')
          return ok(hobbiesView(repository.addHobbies(user.id, hobbies) as User))
        }),
    },
    {
      method: 'DELETE',
      path: '/users/:id/hobbies/:hobby',
      summary: 'Remove one hobby',
      handler: ({ params }) =>
        withUser(params, (user) => {
          const hobby = params.hobby ?? ''
          if (!user.hobbies.includes(hobby)) {
            return fail(404, `${user.name} has no hobby called "${hobby}"`)
          }
          return ok(hobbiesView(repository.removeHobby(user.id, hobby) as User))
        }),
    },
  ]

  /**
   * Finds the route for a request. A known path with an unknown method answers 405, OPTIONS lists
   * the allowed methods, and anything else is 404.
   */
  const handle = (request: ApiRequest): ApiResponse => {
    const method = request.method.toUpperCase()
    const matches = routes.flatMap((route) => {
      const params = matchPath(route.path, request.path)
      return params ? [{ route, params }] : []
    })
    if (matches.length === 0) return fail(404, 'Requested resource not found')

    const allow = [...new Set(matches.map(({ route }) => route.method)), 'OPTIONS'].join(', ')
    if (method === 'OPTIONS') return { status: 204, headers: { Allow: allow } }

    const match = matches.find(({ route }) => route.method === method)
    if (!match)
      return {
        ...fail(405, `${method} is not allowed on ${request.path}`),
        headers: { Allow: allow },
      }

    return match.route.handler({ params: match.params, body: request.body })
  }

  return {
    handle,
    /** The list of endpoints, for the docs on the project page. */
    routes: routes.map(({ method, path, summary }) => ({ method, path, summary })),
  }
}

export type UsersApi = ReturnType<typeof createUsersApi>
