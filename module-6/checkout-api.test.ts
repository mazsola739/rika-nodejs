/**
 * The checkout API over real HTTP, run twice: with the in-memory store (module 6) and with SQLite
 * (module 7). The same tests pass for both – that is the point of the layers.
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createSqliteStore } from '../module-7/sqlite-store.ts'
import type { ApiRequest } from '../shared/http.ts'
import { createApp } from './app.ts'
import { createDispatcher } from './dispatch.ts'
import { Messages } from './routes.ts'
import { type CheckoutStore, createMemoryStore } from './store.ts'

const ANN = '1ec6b2b6-38f6-493f-ac50-405c71e883ac' // has a wine opener and 3 candles in the cart
const BOB = '5eced5ef-9960-4d08-9b80-ff90c6f76a1c'
const WINE_OPENER = '7bafd526-4155-4d78-9895-75cc92ad0c36'
const LOLLIPOP = '2c054cc1-7e53-4764-a378-c642b4de48da'
const CANDLE = 'fae70882-0f1f-44d4-b238-6e29d065b148'

const stores: [string, () => CheckoutStore][] = [
  ['in memory (module 6)', () => createMemoryStore()],
  ['in SQLite (module 7)', () => createSqliteStore(':memory:')],
]

// biome-ignore lint/suspicious/noExplicitAny: the answers are checked by expect(), not by the types
type Json = { data: any; error: { message: string } | null }

describe.each(stores)('checkout API %s', (_name, makeStore) => {
  let server: Server
  let base = ''

  beforeEach(async () => {
    server = createApp(makeStore()).listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    base = `http://localhost:${(server.address() as AddressInfo).port}`
  })
  afterEach(() => {
    server.close()
  })

  const request = async (
    method: string,
    path: string,
    user: string | null = ANN,
    body?: unknown,
  ) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(user && { 'x-user-id': user }),
        ...(body !== undefined && { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    })
    const type = response.headers.get('content-type') ?? ''
    return {
      status: response.status,
      json: (type.includes('json') ? await response.json() : null) as Json,
      text: type.includes('html') ? await response.text() : '',
    }
  }

  describe('auth', () => {
    it('answers 403 without the x-user-id header', async () => {
      const { status, json } = await request('GET', '/api/products', null)
      expect(status).toBe(403)
      expect(json).toEqual({ data: null, error: { message: Messages.FORBIDDEN } })
    })

    it('answers 401 for a user that does not exist', async () => {
      const { status, json } = await request('GET', '/api/profile/cart', crypto.randomUUID())
      expect(status).toBe(401)
      expect(json.error?.message).toBe(Messages.UNAUTHORIZED)
    })
  })

  describe('products', () => {
    it('lists the products', async () => {
      const { status, json } = await request('GET', '/api/products')
      expect(status).toBe(200)
      expect(json.data).toHaveLength(4)
      expect(json.data[0]).toEqual({
        id: WINE_OPENER,
        title: 'Electric Gun Wine Opener',
        description: expect.any(String),
        price: 19.99,
      })
    })

    it('returns one product, or 404', async () => {
      expect((await request('GET', `/api/products/${CANDLE}`)).json.data.title).toBe(
        'Coffin Skeleton Candle',
      )
      const missing = await request('GET', `/api/products/${crypto.randomUUID()}`)
      expect(missing.status).toBe(404)
      expect(missing.json.error?.message).toBe(Messages.PRODUCT_NOT_FOUND)
    })
  })

  describe('cart', () => {
    it('returns the cart with its total', async () => {
      const { status, json } = await request('GET', '/api/profile/cart')
      expect(status).toBe(200)
      expect(json.data.cart.items.map((item: { count: number }) => item.count)).toEqual([1, 3])
      expect(json.data.total).toBe(49.96) // 19.99 + 3 × 9.99
    })

    it('adds a product, changes a count and takes a product out', async () => {
      await request('PUT', '/api/profile/cart', ANN, { productId: LOLLIPOP, count: 2 })
      await request('PUT', '/api/profile/cart', ANN, { productId: CANDLE, count: 1 })
      const { status, json } = await request('PUT', '/api/profile/cart', ANN, {
        productId: WINE_OPENER,
        count: 0,
      })

      expect(status).toBe(200)
      expect(
        json.data.cart.items.map(
          ({ product, count }: { product: { id: string }; count: number }) => [product.id, count],
        ),
      ).toEqual([
        [CANDLE, 1],
        [LOLLIPOP, 2],
      ])
      expect(json.data.total).toBe(89.97)
    })

    it('validates the body with Joi', async () => {
      const { status, json } = await request('PUT', '/api/profile/cart', ANN, {
        productId: 'not-a-uuid',
        count: -1,
      })
      expect(status).toBe(400)
      expect(json.error?.message).toBe(
        '"productId" must be a valid GUID; "count" must be greater than or equal to 0',
      )
    })

    it('answers 404 for a product that does not exist', async () => {
      const { status } = await request('PUT', '/api/profile/cart', ANN, {
        productId: crypto.randomUUID(),
        count: 1,
      })
      expect(status).toBe(404)
    })

    it('answers 400 for a body that is not JSON', async () => {
      const { status, json } = await request('PUT', '/api/profile/cart', ANN, '{ "count": ')
      expect(status).toBe(400)
      expect(json.error?.message).toBe(Messages.INVALID_JSON)
    })

    it('empties the cart: the next request gets a new, empty cart', async () => {
      const before = await request('GET', '/api/profile/cart')
      expect((await request('DELETE', '/api/profile/cart')).json).toEqual({
        data: { success: true },
        error: null,
      })

      const after = await request('GET', '/api/profile/cart')
      expect(after.json.data.cart.id).not.toBe(before.json.data.cart.id)
      expect(after.json.data).toMatchObject({ cart: { items: [] }, total: 0 })
    })
  })

  describe('checkout', () => {
    it('turns the cart into an order and empties the cart', async () => {
      const { status, json } = await request('POST', '/api/profile/cart/checkout', ANN, {
        delivery: { type: 'post', address: 'Gotham, 1007 Mountain Drive' },
        comments: 'Please ring twice',
      })

      expect(status).toBe(200)
      expect(json.data.order).toMatchObject({
        userId: ANN,
        status: 'created',
        total: 49.96,
        payment: { type: 'card' },
        delivery: { type: 'post', address: 'Gotham, 1007 Mountain Drive' },
        comments: 'Please ring twice',
      })
      expect((await request('GET', '/api/profile/cart')).json.data.cart.items).toEqual([])

      const orders = await request('GET', '/api/profile/orders')
      expect(orders.json.data).toEqual([json.data.order])
      expect((await request('GET', '/api/profile/orders', BOB)).json.data).toEqual([])
    })

    it('answers 400 for an empty cart', async () => {
      await request('DELETE', '/api/profile/cart')
      const { status, json } = await request('POST', '/api/profile/cart/checkout')
      expect(status).toBe(400)
      expect(json.error?.message).toBe(Messages.CART_EMPTY)
    })

    it('validates the checkout details', async () => {
      const { status } = await request('POST', '/api/profile/cart/checkout', ANN, {
        delivery: { address: 'no type' },
      })
      expect(status).toBe(400)
    })
  })

  it('is a teapot at /teapot, and 404 elsewhere', async () => {
    const teapot = await request('GET', '/teapot', null)
    expect(teapot.status).toBe(418)
    expect(teapot.text).toContain("I'm a teapot")

    const missing = await request('GET', '/api/nothing')
    expect(missing.status).toBe(404)
    expect(missing.json.error?.message).toBe(Messages.NOT_FOUND)
  })
})

describe('the browser dispatcher', () => {
  it('answers exactly like the Express app', async () => {
    const server = createApp(createMemoryStore()).listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    const base = `http://localhost:${(server.address() as AddressInfo).port}`
    const { dispatch } = createDispatcher(createMemoryStore())

    const script: ApiRequest[] = [
      { method: 'GET', path: '/api/products' },
      { method: 'GET', path: '/api/profile/cart', headers: { 'x-user-id': BOB } },
      { method: 'GET', path: '/api/profile/cart', headers: { 'x-user-id': 'nobody' } },
      {
        method: 'PUT',
        path: '/api/profile/cart',
        headers: { 'x-user-id': BOB },
        body: { count: 1 },
      },
      {
        method: 'PUT',
        path: '/api/profile/cart',
        headers: { 'x-user-id': BOB },
        body: { productId: CANDLE, count: 4 },
      },
      { method: 'POST', path: '/api/profile/cart/checkout', headers: { 'x-user-id': BOB } },
      { method: 'POST', path: '/api/profile/cart/checkout', headers: { 'x-user-id': BOB } },
      { method: 'PATCH', path: '/api/profile/cart', headers: { 'x-user-id': BOB } },
    ]

    try {
      for (const step of script) {
        const response = await fetch(`${base}${step.path}`, {
          method: step.method,
          headers: { ...step.headers, 'content-type': 'application/json' },
          body: step.body === undefined ? undefined : JSON.stringify(step.body),
        })
        const browser = dispatch(step)

        expect(browser.status).toBe(response.status)
        // Ids and the order are random: compare the shape of the answer without them.
        expect(strip(browser.body)).toEqual(strip(await response.json()))
      }
    } finally {
      server.close()
    }
  })
})

/** Replaces every uuid with a placeholder, so two runs can be compared. */
const strip = (value: unknown) =>
  JSON.parse(
    JSON.stringify(value).replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
      'uuid',
    ),
  )
