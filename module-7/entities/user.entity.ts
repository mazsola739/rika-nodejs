import { Entity, PrimaryKey } from '@mikro-orm/core'
import { randomUUID } from 'node:crypto'

export type UserEntity = {
	id: string
}

@Entity()
export class User {
	@PrimaryKey({ type: 'uuid' })
	id: string = randomUUID()
}
