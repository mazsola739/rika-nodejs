/**
 * The data layer of the checkout API. The service only knows the `CheckoutStore` interface:
 * module 6 keeps the data in memory (below), module 7 keeps it in SQLite – nothing else changes.
 */
import seedCarts from './data/carts.json'
import seedProducts from './data/products.json'
import seedUsers from './data/users.json'

export type Product = { id: string; title: string; description: string; price: number }
export type User = { id: string }
export type CartItem = { product: Product; count: number }
export type Cart = { id: string; userId: string; isDeleted: boolean; items: CartItem[] }

export type OrderStatus = 'created' | 'completed'
export type Order = {
  id: string
  userId: string
  cartId: string
  items: CartItem[]
  payment: { type: string; address?: string; creditCard?: string }
  delivery: { type: string; address: string }
  comments: string
  status: OrderStatus
  total: number
}

export interface CheckoutStore {
  findUser(id: string): User | undefined
  listProducts(): Product[]
  findProduct(id: string): Product | undefined
  /** The user's cart that is not deleted yet. */
  findActiveCart(userId: string): Cart | undefined
  createCart(userId: string): Cart
  /** Sets how many of a product are in the cart; 0 takes it out. */
  setItemCount(cartId: string, productId: string, count: number): void
  /** Soft delete: the cart stays (an order may point to it), but it is not active any more. */
  deleteCart(cartId: string): void
  saveOrder(order: Order): void
  listOrders(userId: string): Order[]
}

/** The seed data: four products, three users, and a cart for each user. */
export const seed = {
  users: seedUsers as User[],
  products: seedProducts as Product[],
  carts: (seedCarts as Cart[]).map(({ items, ...cart }) => ({
    ...cart,
    items: items.map(({ product, count }) => ({ productId: product.id, count })),
  })),
}

export type Seed = typeof seed

type StoredCart = Omit<Cart, 'items'> & { items: { productId: string; count: number }[] }

/** Everything in memory. Each store gets its own copy of the seed, so tests never share state. */
export const createMemoryStore = (initial: Seed = seed): CheckoutStore => {
  const { users, products, carts } = structuredClone(initial)
  const orders: Order[] = []

  const findProduct = (id: string) => products.find((product) => product.id === id)

  const toCart = ({ items, ...cart }: StoredCart): Cart => ({
    ...cart,
    items: items.flatMap(({ productId, count }) => {
      const product = findProduct(productId)
      return product ? [{ product: { ...product }, count }] : []
    }),
  })

  const findStoredCart = (id: string) => carts.find((cart) => cart.id === id)

  return {
    findUser: (id) => users.find((user) => user.id === id),
    listProducts: () => products.map((product) => ({ ...product })),
    findProduct: (id) => {
      const product = findProduct(id)
      return product && { ...product }
    },

    findActiveCart(userId) {
      const cart = carts.find((item) => item.userId === userId && !item.isDeleted)
      return cart && toCart(cart)
    },

    createCart(userId) {
      const cart: StoredCart = { id: crypto.randomUUID(), userId, isDeleted: false, items: [] }
      carts.push(cart)
      return toCart(cart)
    },

    setItemCount(cartId, productId, count) {
      const cart = findStoredCart(cartId)
      if (!cart) return
      const item = cart.items.find((entry) => entry.productId === productId)

      if (count === 0) cart.items = cart.items.filter((entry) => entry.productId !== productId)
      else if (item) item.count = count
      else cart.items.push({ productId, count })
    },

    deleteCart(cartId) {
      const cart = findStoredCart(cartId)
      if (cart) cart.isDeleted = true
    },

    saveOrder(order) {
      orders.push(structuredClone(order))
    },

    listOrders: (userId) => structuredClone(orders.filter((order) => order.userId === userId)),
  }
}
