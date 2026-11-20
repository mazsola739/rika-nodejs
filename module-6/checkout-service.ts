/** The business logic of the checkout: carts, totals and orders. No HTTP, no storage details. */
import type { Cart, CartItem, CheckoutStore, Order } from './store.ts'

export type Result<T, E extends string> = { ok: true; value: T } | { ok: false; error: E }

export type CartView = { cart: Pick<Cart, 'id' | 'items'>; total: number }

export type CheckoutDetails = Partial<Pick<Order, 'payment' | 'delivery' | 'comments'>>

/** In cents, so 0.1 + 0.2 stays 0.3. */
export const cartTotal = (items: CartItem[]) =>
  items.reduce((cents, { product, count }) => cents + Math.round(product.price * 100) * count, 0) /
  100

export const createCheckoutService = (store: CheckoutStore) => {
  /** Every user has a cart: if there is none, it is created on the first request. */
  const activeCart = (userId: string) => store.findActiveCart(userId) ?? store.createCart(userId)

  const view = ({ id, items }: Cart): CartView => ({ cart: { id, items }, total: cartTotal(items) })

  return {
    listProducts: () => store.listProducts(),
    findProduct: (id: string) => store.findProduct(id),

    getCart: (userId: string): CartView => view(activeCart(userId)),

    /** Adds a product, changes its count, or takes it out with count 0. */
    updateCart(
      userId: string,
      { productId, count }: { productId: string; count: number },
    ): Result<CartView, 'PRODUCT_NOT_FOUND'> {
      if (!store.findProduct(productId)) return { ok: false, error: 'PRODUCT_NOT_FOUND' }

      const cart = activeCart(userId)
      store.setItemCount(cart.id, productId, count)
      return { ok: true, value: view(activeCart(userId)) }
    },

    emptyCart(userId: string) {
      const cart = store.findActiveCart(userId)
      if (cart) store.deleteCart(cart.id)
      return { success: true }
    },

    /** Turns the cart into an order, then empties the cart. */
    checkout(
      userId: string,
      details: CheckoutDetails = {},
    ): Result<{ order: Order }, 'CART_EMPTY'> {
      const cart = store.findActiveCart(userId)
      if (!cart || cart.items.length === 0) return { ok: false, error: 'CART_EMPTY' }

      const order: Order = {
        id: crypto.randomUUID(),
        userId,
        cartId: cart.id,
        items: cart.items,
        payment: details.payment ?? { type: 'card' },
        delivery: details.delivery ?? { type: 'post', address: '' },
        comments: details.comments ?? '',
        status: 'created',
        total: cartTotal(cart.items),
      }
      store.saveOrder(order)
      store.deleteCart(cart.id)
      return { ok: true, value: { order } }
    },

    listOrders: (userId: string) => store.listOrders(userId),
  }
}

export type CheckoutService = ReturnType<typeof createCheckoutService>
