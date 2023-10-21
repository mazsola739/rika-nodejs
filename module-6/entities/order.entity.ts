import { CartItemEntity } from './cart.entity'

type ORDER_STATUS = 'created' | 'completed'

export type OrderEntity = {
	id: string
	userId: string
	cartId: string
	items: CartItemEntity[]
	payment: {
		type: string
		address?: string
		creditCard?: string
	}
	delivery: {
		type: string
		address: string
	}
	comments: string
	status: ORDER_STATUS
	totalPrice: number
}
