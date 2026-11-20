/**
 * The checkout API without Express: the same routes, the same auth and validation, in the same
 * order as the middleware in app.ts. The project page runs the API with this in the browser, and
 * a test checks that it answers exactly like the Express app.
 */
import { type ApiRequest, type ApiResponse, fail, header, matchPath } from '../shared/http.ts'
import { createCheckoutService } from './checkout-service.ts'
import { authenticate, createCheckoutRoutes, Messages, USER_HEADER } from './routes.ts'
import { type CheckoutStore, createMemoryStore } from './store.ts'
import { validateBody } from './validation.ts'

export const createDispatcher = (store: CheckoutStore = createMemoryStore()) => {
  const routes = createCheckoutRoutes(createCheckoutService(store))

  const dispatch = (request: ApiRequest): ApiResponse => {
    const method = request.method.toUpperCase()

    for (const route of routes) {
      const params = route.method === method ? matchPath(route.path, request.path) : null
      if (!params) continue

      const userId = header(request, USER_HEADER)
      if (route.auth) {
        const failure = authenticate(store, userId)
        if (failure) return failure
      }

      let body = request.body
      if (route.schema) {
        const result = validateBody(route.schema, body)
        if ('error' in result) return fail(400, result.error)
        body = result.value
      }

      return route.handler({ userId: userId ?? '', params, body })
    }

    return fail(404, Messages.NOT_FOUND)
  }

  return {
    dispatch,
    routes: routes.map(({ method, path, summary, auth }) => ({ method, path, summary, auth })),
  }
}
