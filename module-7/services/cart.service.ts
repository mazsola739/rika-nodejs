import { Request } from 'express'
import { cartRepository } from '../repositories'
import { EmptySuccessResponse, ErrorResponse } from '../types'
import { Cart, Order } from '../entities'

const getCart = (req: Request) => {
	return cartRepository.getCart(req)
}

const updateCart = (req: Request): [Cart, ErrorResponse] => {
	return cartRepository.updateCart(req)
}

const emptyCart = (req: Request): EmptySuccessResponse | ErrorResponse => {
	return cartRepository.emptyCart(req)
}

const createOrder = (req: Request): [Order, ErrorResponse] => {
	return cartRepository.createOrder(req)
}

export const cartService = {
	getCart,
	updateCart,
	emptyCart,
	createOrder,
}
