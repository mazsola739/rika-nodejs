import { Collection } from '@mikro-orm/core'
import { CartItem } from '../entities'

export const calculateCartTotal = (cartItems: Collection<CartItem>): number => {
	const total = cartItems.reduce(
		(total, item) => total + item.product.price * item.count,
		0
	)

	return Number(total.toFixed(2))
}
