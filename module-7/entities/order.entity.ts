import { Embedded, Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core'
import { randomUUID } from 'node:crypto'
import { CartItemEntity } from '.'

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

export type OrderCreateEntity = Omit<
	OrderEntity,
	'id' | 'userId' | 'status' | 'totalPrice'
>

@Entity()
export class PaymentDetails {
	@Property({ type: 'string' })
	type!: string

	@Property({ type: 'undefined' })
	address?: string | undefined

	@Property({ type: 'string' })
	creditCard?: string
}

@Entity()
export class DeliveryDetails {
	@Property({ type: 'string' })
	type!: string

	@Property({ type: 'undefined' })
	address!: string | undefined
}

enum OrderStatus {
	CREATED = 'created',
	COMPLETED = 'completed',
}

@Entity()
export class Order {
	@PrimaryKey({ type: 'uuid' })
	id: string = randomUUID()

	@Property({ type: 'uuid' })
	userId: string = randomUUID()

	@Property({ type: 'uuid' })
	cartId: string = randomUUID()

	@Embedded(() => PaymentDetails)
	payment!: PaymentDetails

	@Embedded(() => DeliveryDetails)
	delivery!: DeliveryDetails

	@Property()
	comments!: string

	@Enum({
		items: () => OrderStatus,
		array: true,
		default: [OrderStatus.CREATED],
	})
	status: OrderStatus[] = [OrderStatus.CREATED]

	@Property()
	totalPrice!: number
}
