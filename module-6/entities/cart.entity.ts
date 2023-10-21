import { ProductEntity } from './product.entity'

export type CartItemEntity = {
	product: ProductEntity
	count: number
}

export type CartEntity = {
	id: string
	userId: string
	isDeleted: boolean
	items: CartItemEntity[]
}
