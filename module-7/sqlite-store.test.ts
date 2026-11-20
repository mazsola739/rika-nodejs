import { afterEach, describe, expect, it } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createCheckoutService } from '../module-6/checkout-service.ts'
import { createSqliteStore } from './sqlite-store.ts'

const ANN = '1ec6b2b6-38f6-493f-ac50-405c71e883ac'
const CANDLE = 'fae70882-0f1f-44d4-b238-6e29d065b148'

// Windows cannot delete an open database file: everything opened here is closed after each test.
const dirs: string[] = []
const closers: (() => void)[] = []

afterEach(() => {
  for (const close of closers.splice(0)) close()
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

const tempFile = () => {
  const dir = mkdtempSync(join(tmpdir(), 'rika-nodejs-'))
  dirs.push(dir)
  return join(dir, 'checkout.db')
}

const store = (file?: string) => {
  const opened = createSqliteStore(file)
  closers.push(() => opened.close())
  return opened
}

/** A direct connection to the file, to look at (or change) the tables. */
const database = (file: string) => {
  const db = new DatabaseSync(file)
  let open = true
  const close = () => {
    if (open) db.close()
    open = false
  }
  closers.push(close)
  return { prepare: (sql: string) => db.prepare(sql), close }
}

describe('SQLite store', () => {
  it('fills a new database with the seed data once', () => {
    const file = tempFile()
    store(file).close()
    store(file)

    const db = database(file)
    expect(db.prepare('SELECT COUNT(*) AS count FROM products').get()).toEqual({ count: 4 })
    expect(db.prepare('SELECT COUNT(*) AS count FROM carts').get()).toEqual({ count: 3 })
  })

  it('keeps carts and orders after a restart', () => {
    const file = tempFile()
    const first = store(file)
    const before = createCheckoutService(first)
    before.updateCart(ANN, { productId: CANDLE, count: 5 })
    const result = before.checkout(ANN)
    expect(result.ok).toBe(true)
    first.close()

    const after = createCheckoutService(store(file))
    expect(after.getCart(ANN).cart.items).toEqual([])
    const [order] = after.listOrders(ANN)
    expect(order).toEqual(result.ok ? result.value.order : undefined)
    expect(order?.total).toBe(69.94) // 19.99 + 5 × 9.99
  })

  it('keeps the price of an order when the product price changes later', () => {
    const file = tempFile()
    const first = store(file)
    createCheckoutService(first).checkout(ANN)
    first.close()

    const db = database(file)
    db.prepare('UPDATE products SET price = 1 WHERE id = ?').run(CANDLE)
    db.close()

    const [order] = createCheckoutService(store(file)).listOrders(ANN)
    expect(order?.items.find((item) => item.product.id === CANDLE)?.product.price).toBe(9.99)
  })

  it('allows only one active cart per user', () => {
    expect(() => store().createCart(ANN)).toThrow()
  })
})
