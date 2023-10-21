import { Options } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

const config: Options<PostgreSqlDriver> = {
	entities: ['module-7/dist/**/*.entity.js'],
	entitiesTs: ['module-7/**/*.entity.ts'],
	dbName: 'node_gmp',
	type: 'postgresql',
	user: 'node_gmp',
	password: 'password123',
	migrations: {
		path: 'module-7/migrations',
	},
	seeder: {
		path: 'module-7/seeders',
	},
}

export default config
