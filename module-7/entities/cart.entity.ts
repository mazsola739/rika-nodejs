import {
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryKey,
	Property,
} from '@mikro-orm/core'
import { randomUUID } from 'node:crypto'
import { Product, ProductEntity, User } from '.'

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

@Entity()
export class Cart {
	@PrimaryKey({ type: 'uuid' })
	id: string = randomUUID()

	@Property({ type: 'uuid' })
	userId!: string

	@Property({ type: 'boolean' })
	isDeleted!: boolean

	@OneToMany(() => CartItem, (item) => item.product)
	items = new Collection<CartItem>(this)
}

@Entity()
export class CartItem {
	@PrimaryKey({ type: 'uuid' })
	id: string = randomUUID()

	@ManyToOne(() => Product)
	product!: Product

	@Property({ type: 'number' })
	count!: number
}
