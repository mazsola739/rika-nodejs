import { Order } from '../entities'

const orders: Order[] = []

export const getOrderByUserId = (userId: string): Order[] => {
	return orders.filter((order) => order.userId === userId)
}

export const userRepository = { getOrderByUserId }
