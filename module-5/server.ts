/**
 * Module 5 – the users API on node:http. Run: bun run module-5, then e.g.
 * curl http://localhost:3000/users
 */
import { createServer, type IncomingMessage } from 'node:http'
import type { ApiResponse } from '../shared/http.ts'
import { createUsersApi, type UsersApi } from './users-api.ts'

const MAX_BODY_BYTES = 100_000

class BadRequest extends Error {}

const readJson = async (request: IncomingMessage): Promise<unknown> => {
  let size = 0
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new BadRequest('The body is too large')
    chunks.push(chunk)
  }

  const text = Buffer.concat(chunks).toString('utf8').trim()
  if (text === '') return undefined
  try {
    return JSON.parse(text)
  } catch {
    throw new BadRequest('The body is not valid JSON')
  }
}

/** node:http in, ApiRequest to the API, ApiResponse back out as JSON. */
export const createUsersServer = (api: UsersApi = createUsersApi()) =>
  createServer(async (request, response) => {
    let result: ApiResponse
    try {
      const { pathname } = new URL(request.url ?? '/', 'http://localhost')
      result = api.handle({
        method: request.method ?? 'GET',
        path: pathname,
        headers: request.headers as Record<string, string>,
        body: await readJson(request),
      })
    } catch (error) {
      const message = error instanceof BadRequest ? error.message : 'Internal server error'
      result = {
        status: error instanceof BadRequest ? 400 : 500,
        body: { data: null, error: { message } },
      }
    }

    response.writeHead(result.status, {
      ...(result.body !== undefined && { 'Content-Type': 'application/json; charset=utf-8' }),
      ...result.headers,
    })
    response.end(result.body === undefined ? undefined : JSON.stringify(result.body))
  })

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000)
  createUsersServer().listen(port, () => console.log(`Users API on http://localhost:${port}`))
}
