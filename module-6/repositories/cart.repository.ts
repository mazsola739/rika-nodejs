import carts from '../db/carts.json'
import { randomUUID } from 'node:crypto'
import { Request } from 'express'
import { OrderEntity, CartEntity, CartItemEntity } from '../entities'
import { EmptySuccessResponse, ErrorResponse } from '../types'
import { productRepository } from './product.repository'
import { Messages } from '../constants'

let allCarts = carts
const orders: OrderEntity[] = []

const getCart = (req: Request): CartEntity => {
	const userId = req.headers['x-user-id'] as string

	let cart = allCarts.find((cart) => cart.userId === userId && !cart.isDeleted)
	if (!cart) {
		cart = createCart(userId)
	}

	return cart
}

const createCart = (userId: string): CartEntity => {
	const newCart: CartEntity = {
		id: randomUUID(),
		userId: userId,
		isDeleted: false,
		items: [],
	}
	allCarts.push(newCart)
	return newCart
}

const updateCart = (req: Request): [CartEntity, ErrorResponse] => {
	const { productId, count } = req.body
	const cart = getCart(req)
	const productToUpdate = productRepository.getProductById(productId)

	if (!productToUpdate) {
		return [null, { message: 'product not exists' }]
	}

	const productExistsInCart = cart.items.find(
		(item) => item.product.id === productId
	)

	if (productExistsInCart) {
		productExistsInCart.count = count
		return [cart, null]
	}

	const newItem: CartItemEntity = {
		product: productToUpdate,
		count,
	}

	cart.items.push(newItem)

	return [cart, null]
}

const emptyCart = (req: Request): EmptySuccessResponse | ErrorResponse => {
	const cart = getCart(req)

	if (cart) {
		cart.isDeleted = true

		return { data: { success: true }, error: null }
	}

	return { message: Messages.CART_NOT_FOUND_MESSAGE }
}

const cartIsEmpty = (cart: CartEntity) =>
	cart.isDeleted || cart.items.length === 0

const createOrder = (req: Request): [OrderEntity, ErrorResponse] => {
	const cart = getCart(req)

	if (cartIsEmpty(cart)) {
		return [null, { message: Messages.CHECKOUT_BAD_REQUEST_MESSAGE }]
	}

	const userId = req.headers['x-user-id'] as string
	const totalPrice = calculateCartTotal(cart.items)
	const orderItems: CartItemEntity[] = cart.items.map((item) => {
		return {
			product: { ...item.product },
			count: item.count,
		}
	})

	const newOrder: OrderEntity = {
		id: randomUUID(),
		userId,
		cartId: cart.id,
		items: orderItems,
		payment: {
			type: '',
			address: '',
			creditCard: '',
		},
		delivery: {
			type: '',
			address: '',
		},
		comments: '',
		status: 'created',
		totalPrice,
	}

	orders.push(newOrder)
	emptyCart(req)

	return [newOrder, null]
}

const calculateCartTotal = (cartItems: CartItemEntity[]): number => {
	const total = cartItems.reduce(
		(total, item) => total + item.product.price * item.count,
		0
	)

	return Number(total.toFixed(2))
}

export const cartRepository = {
	getCart,
	createCart,
	updateCart,
	emptyCart,
	createOrder,
}
