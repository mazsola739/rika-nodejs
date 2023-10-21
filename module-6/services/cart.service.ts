import { Request } from 'express'
import { CartEntity, OrderEntity } from '../entities'
import { cartRepository } from '../repositories'
import { EmptySuccessResponse, ErrorResponse } from '../types'

const getCart = (req: Request) => {
	return cartRepository.getCart(req)
}

const updateCart = (req: Request): [CartEntity, ErrorResponse] => {
	return cartRepository.updateCart(req)
}

const emptyCart = (req: Request): EmptySuccessResponse | ErrorResponse => {
	return cartRepository.emptyCart(req)
}

const createOrder = (req: Request): [OrderEntity, ErrorResponse] => {
	return cartRepository.createOrder(req)
}

export const cartService = {
	getCart,
	updateCart,
	emptyCart,
	createOrder,
}
