/**
 * Module 6 – Express & layered architecture: router → middleware (auth, validation) →
 * controller (the route handler) → service → store.
 */
import express, { type ErrorRequestHandler, type RequestHandler, type Response } from 'express'
import { type ApiResponse, fail } from '../shared/http.ts'
import { createCheckoutService } from './checkout-service.ts'
import {
  authenticate,
  type CheckoutRoute,
  createCheckoutRoutes,
  Messages,
  USER_HEADER,
} from './routes.ts'
import { type CheckoutStore, createMemoryStore } from './store.ts'
import { validateBody } from './validation.ts'

const send = (res: Response, { status, body, headers }: ApiResponse) => {
  res.status(status).set(headers ?? {})
  if (typeof body === 'string') res.send(body)
  else if (body === undefined) res.end()
  else res.json(body)
}

/** Lets only known users through, and remembers who they are for the next handlers. */
const authMiddleware =
  (store: CheckoutStore): RequestHandler =>
  (req, res, next) => {
    const userId = req.get(USER_HEADER)
    const failure = authenticate(store, userId)
    if (failure) return send(res, failure)
    res.locals.userId = userId
    next()
  }

/** Joi validation; the request goes on with the cleaned body. */
const validationMiddleware =
  (schema: NonNullable<CheckoutRoute['schema']>): RequestHandler =>
  (req, res, next) => {
    const result = validateBody(schema, req.body)
    if ('error' in result) return send(res, fail(400, result.error))
    res.locals.body = result.value
    next()
  }

const controller =
  (route: CheckoutRoute): RequestHandler =>
  (req, res) =>
    send(
      res,
      route.handler({
        userId: res.locals.userId,
        params: req.params as Record<string, string>,
        body: res.locals.body ?? req.body,
      }),
    )

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') return send(res, fail(400, Messages.INVALID_JSON))
  console.error(error)
  send(res, fail(500, Messages.INTERNAL_SERVER_ERROR))
}

export const createApp = (store: CheckoutStore = createMemoryStore()) => {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json())

  for (const route of createCheckoutRoutes(createCheckoutService(store))) {
    const handlers: RequestHandler[] = [
      ...(route.auth ? [authMiddleware(store)] : []),
      ...(route.schema ? [validationMiddleware(route.schema)] : []),
      controller(route),
    ]
    app[route.method.toLowerCase() as 'get' | 'put' | 'post' | 'delete'](route.path, ...handlers)
  }

  // The last two: anything not matched above is a 404, and any thrown error a 500.
  app.use((_req, res) => send(res, fail(404, Messages.NOT_FOUND)))
  app.use(errorMiddleware)
  return app
}
