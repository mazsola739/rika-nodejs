/**
 * The endpoints of the checkout API as data: method, path, whether the user must be known, the Joi
 * schema of the body, and a handler that gets plain values and returns an ApiResponse.
 * app.ts turns this list into Express routes with middleware; dispatch.ts runs it without Express.
 */
import type Joi from 'joi'
import { type ApiResponse, fail, ok, type Params } from '../shared/http.ts'
import type { CheckoutDetails, CheckoutService } from './checkout-service.ts'
import type { CheckoutStore } from './store.ts'
import { cartUpdateSchema, checkoutSchema } from './validation.ts'

export const Messages = {
  FORBIDDEN: 'You must be authorized user',
  UNAUTHORIZED: 'User is not authorized',
  PRODUCT_NOT_FOUND: 'No product with such id',
  CART_EMPTY: 'Cart is empty',
  NOT_FOUND: 'Ooops, there is nothing here',
  INVALID_JSON: 'The body is not valid JSON',
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const

export const USER_HEADER = 'x-user-id'

export type HandlerInput = { userId: string; params: Params; body: unknown }

export type CheckoutRoute = {
  method: 'GET' | 'PUT' | 'POST' | 'DELETE'
  path: string
  summary: string
  /** The user in the x-user-id header must exist. */
  auth: boolean
  schema?: Joi.Schema
  handler: (input: HandlerInput) => ApiResponse
}

/** 403 without the header, 401 for a user that does not exist, otherwise null (go on). */
export const authenticate = (
  store: CheckoutStore,
  userId: string | undefined,
): ApiResponse | null => {
  if (!userId) return fail(403, Messages.FORBIDDEN)
  if (!store.findUser(userId)) return fail(401, Messages.UNAUTHORIZED)
  return null
}

/** No project is complete without a teapot. ^.^ */
export const TEAPOT = `<!doctype html>
<html lang="en">
  <body style="color: #3367d6; font-family: monospace; white-space: pre; line-height: 1.1">
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣘⣿⣿⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣀⣀⡀⠀⠀⠀⢀⣀⠘⠛⠛⠛⠛⠛⠛⠁⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢠⡿⠋⠉⠛⠃⣠⣤⣈⣉⡛⠛⠛⠛⠛⠛⠛⢛⣉⣁⣤⣄⠀⠀⣾⣿⡿⠗⠀
⠀⢸⡇⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⣿⣿⠀⠀⠀
⠀⢸⣇⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⢉⣉⣠⣿⣿⡀⠀⠀
⠀⠀⠙⠷⡆⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⢰⣿⣿⣿⣿⣿⡇⠀⠀
⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠸⣿⣿⣿⣿⠟⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠄⠈⠉⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢄⣉⠉⠛⠛⠛⠛⠛⠋⢉⣉⡠⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⠿⠿⠿⠿⠿⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
I'm a teapot.
  </body>
</html>
`

export const createCheckoutRoutes = (service: CheckoutService): CheckoutRoute[] => [
  {
    method: 'GET',
    path: '/api/products',
    summary: 'All products',
    auth: true,
    handler: () => ok(service.listProducts()),
  },
  {
    method: 'GET',
    path: '/api/products/:productId',
    summary: 'One product',
    auth: true,
    handler: ({ params }) => {
      const product = service.findProduct(params.productId ?? '')
      return product ? ok(product) : fail(404, Messages.PRODUCT_NOT_FOUND)
    },
  },
  {
    method: 'GET',
    path: '/api/profile/cart',
    summary: 'The cart of the user (created if missing)',
    auth: true,
    handler: ({ userId }) => ok(service.getCart(userId)),
  },
  {
    method: 'PUT',
    path: '/api/profile/cart',
    summary: 'Set the count of a product: { productId, count }, 0 removes it',
    auth: true,
    schema: cartUpdateSchema,
    handler: ({ userId, body }) => {
      const result = service.updateCart(userId, body as { productId: string; count: number })
      return result.ok ? ok(result.value) : fail(404, Messages.PRODUCT_NOT_FOUND)
    },
  },
  {
    method: 'DELETE',
    path: '/api/profile/cart',
    summary: 'Empty the cart',
    auth: true,
    handler: ({ userId }) => ok(service.emptyCart(userId)),
  },
  {
    method: 'POST',
    path: '/api/profile/cart/checkout',
    summary: 'Turn the cart into an order',
    auth: true,
    schema: checkoutSchema,
    handler: ({ userId, body }) => {
      const result = service.checkout(userId, body as CheckoutDetails)
      return result.ok ? ok(result.value) : fail(400, Messages.CART_EMPTY)
    },
  },
  {
    method: 'GET',
    path: '/api/profile/orders',
    summary: 'The orders of the user',
    auth: true,
    handler: ({ userId }) => ok(service.listOrders(userId)),
  },
  {
    method: 'GET',
    path: '/teapot',
    summary: "418 I'm a teapot",
    auth: false,
    handler: () => ({
      status: 418,
      body: TEAPOT,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }),
  },
]
