/**
 * Module 7 – databases: the checkout data in SQLite, through node:sqlite (built into Node and Bun,
 * no ORM, no Docker). It implements the same CheckoutStore as the in-memory store of module 6,
 * so the routes, the middleware and the service are reused unchanged.
 */
import { DatabaseSync } from 'node:sqlite'
import {
  type Cart,
  type CheckoutStore,
  type Order,
  type Product,
  type Seed,
  seed,
} from '../module-6/store.ts'
import { SCHEMA } from './schema.ts'

type Row = Record<string, unknown>

export type SqliteStore = CheckoutStore & { close(): void }

/** Opens (or creates) the database, creates the tables, and fills an empty database with the seed. */
export const createSqliteStore = (file = ':memory:', initial: Seed = seed): SqliteStore => {
  const db = new DatabaseSync(file)
  let closed = false
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(SCHEMA)

  const transaction = <T>(work: () => T): T => {
    db.exec('BEGIN')
    try {
      const result = work()
      db.exec('COMMIT')
      return result
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  const isEmpty = (db.prepare('SELECT COUNT(*) AS count FROM products').get() as Row).count === 0
  if (isEmpty) {
    transaction(() => {
      const addUser = db.prepare('INSERT INTO users (id) VALUES (?)')
      const addProduct = db.prepare(
        'INSERT INTO products (id, title, description, price) VALUES (?, ?, ?, ?)',
      )
      const addCart = db.prepare('INSERT INTO carts (id, user_id, is_deleted) VALUES (?, ?, ?)')
      const addItem = db.prepare(
        'INSERT INTO cart_items (cart_id, product_id, count) VALUES (?, ?, ?)',
      )

      for (const user of initial.users) addUser.run(user.id)
      for (const p of initial.products) addProduct.run(p.id, p.title, p.description, p.price)
      for (const cart of initial.carts) {
        addCart.run(cart.id, cart.userId, cart.isDeleted ? 1 : 0)
        for (const item of cart.items) addItem.run(cart.id, item.productId, item.count)
      }
    })
  }

  const statements = {
    findUser: db.prepare('SELECT id FROM users WHERE id = ?'),
    listProducts: db.prepare('SELECT id, title, description, price FROM products ORDER BY rowid'),
    findProduct: db.prepare('SELECT id, title, description, price FROM products WHERE id = ?'),
    findActiveCart: db.prepare(
      'SELECT id, user_id FROM carts WHERE user_id = ? AND is_deleted = 0',
    ),
    findCart: db.prepare('SELECT id, user_id, is_deleted FROM carts WHERE id = ?'),
    cartItems: db.prepare(`
      SELECT p.id, p.title, p.description, p.price, ci.count
      FROM cart_items ci JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ? ORDER BY ci.rowid`),
    createCart: db.prepare('INSERT INTO carts (id, user_id) VALUES (?, ?)'),
    upsertItem: db.prepare(`
      INSERT INTO cart_items (cart_id, product_id, count) VALUES (?, ?, ?)
      ON CONFLICT (cart_id, product_id) DO UPDATE SET count = excluded.count`),
    removeItem: db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?'),
    deleteCart: db.prepare('UPDATE carts SET is_deleted = 1 WHERE id = ?'),
    addOrder: db.prepare(`
      INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    addOrderItem: db.prepare(`
      INSERT INTO order_items (order_id, product_id, title, description, price, count)
      VALUES (?, ?, ?, ?, ?, ?)`),
    listOrders: db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at, rowid'),
    orderItems: db.prepare(
      'SELECT product_id, title, description, price, count FROM order_items WHERE order_id = ? ORDER BY rowid',
    ),
  }

  const toProduct = (row: Row): Product => ({
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    price: Number(row.price),
  })

  const loadCart = (row: Row): Cart => ({
    id: String(row.id),
    userId: String(row.user_id),
    isDeleted: Boolean(row.is_deleted),
    items: (statements.cartItems.all(row.id as string) as Row[]).map((item) => ({
      product: toProduct(item),
      count: Number(item.count),
    })),
  })

  return {
    findUser(id) {
      const row = statements.findUser.get(id) as Row | undefined
      return row && { id: String(row.id) }
    },

    listProducts: () => (statements.listProducts.all() as Row[]).map(toProduct),

    findProduct(id) {
      const row = statements.findProduct.get(id) as Row | undefined
      return row && toProduct(row)
    },

    findActiveCart(userId) {
      const row = statements.findActiveCart.get(userId) as Row | undefined
      return row && loadCart({ ...row, is_deleted: 0 })
    },

    createCart(userId) {
      const id = crypto.randomUUID()
      statements.createCart.run(id, userId)
      return loadCart(statements.findCart.get(id) as Row)
    },

    setItemCount(cartId, productId, count) {
      if (count === 0) statements.removeItem.run(cartId, productId)
      else statements.upsertItem.run(cartId, productId, count)
    },

    deleteCart(cartId) {
      statements.deleteCart.run(cartId)
    },

    saveOrder(order) {
      transaction(() => {
        statements.addOrder.run(
          order.id,
          order.userId,
          order.cartId,
          JSON.stringify(order.payment),
          JSON.stringify(order.delivery),
          order.comments,
          order.status,
          order.total,
        )
        for (const { product, count } of order.items) {
          statements.addOrderItem.run(
            order.id,
            product.id,
            product.title,
            product.description,
            product.price,
            count,
          )
        }
      })
    },

    listOrders: (userId) =>
      (statements.listOrders.all(userId) as Row[]).map(
        (row): Order => ({
          id: String(row.id),
          userId: String(row.user_id),
          cartId: String(row.cart_id),
          items: (statements.orderItems.all(row.id as string) as Row[]).map((item) => ({
            product: toProduct({ ...item, id: item.product_id }),
            count: Number(item.count),
          })),
          payment: JSON.parse(String(row.payment)),
          delivery: JSON.parse(String(row.delivery)),
          comments: String(row.comments),
          status: row.status as Order['status'],
          total: Number(row.total),
        }),
      ),

    /** Closes the database file; calling it again does nothing. */
    close() {
      if (closed) return
      closed = true
      db.close()
    },
  }
}
