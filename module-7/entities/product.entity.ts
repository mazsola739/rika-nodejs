import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { randomUUID } from 'node:crypto'

export type ProductEntity = {
	id: string
	title: string
	description: string
	price: number
}

@Entity()
export class Product {
	@PrimaryKey({ type: 'uuid' })
	id: string = randomUUID()

	@Property({ type: 'string' })
	title!: string

	@Property({ type: 'string' })
	description!: string

	@Property({ type: 'number' })
	price!: number
}
