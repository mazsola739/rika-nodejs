import express from 'express'
import { Server } from 'http'
import {
	EntityManager,
	EntityRepository,
	MikroORM,
	RequestContext,
} from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import bodyParser from 'body-parser'
import { Routes, Misc } from './constants'
import { cartRouter, productsRouter } from './routes'
import { Cart, Order, Product, User } from './entities'
import { config } from 'dotenv'
import {
	authMiddleWare,
	errMiddleware,
	notFoundMiddleware,
	teapotMiddleware,
} from './middlewares'

const app = express()

export const DI = {} as {
	server: Server
	orm: MikroORM
	em: EntityManager
	cartRepository: EntityRepository<Cart>
	productRepository: EntityRepository<Product>
	orderRepository: EntityRepository<Order>
	userRepository: EntityRepository<User>
}

export const init = (async () => {
	DI.orm = await MikroORM.init()
	DI.em = DI.orm.em
	DI.cartRepository = DI.orm.em.getRepository(Cart)
	DI.productRepository = DI.orm.em.getRepository(Product)
	DI.orderRepository = DI.orm.em.getRepository(Order)
	DI.userRepository = DI.orm.em.getRepository(User)

	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())

	app.use(express.json())
	app.use(async (_req, _res, next) => {
		const orm = await MikroORM.init<PostgreSqlDriver>(config)
		RequestContext.create(orm.em, next)
	})

	app.use(`${Routes.PROFILE_CART}`, authMiddleWare, cartRouter)
	app.use(`${Routes.PRODUCTS}`, authMiddleWare, productsRouter)
	app.get('/teapot', teapotMiddleware)
	app.use(errMiddleware)
	app.use(notFoundMiddleware)

	DI.server = app.listen(Misc.PORT, () => {
		console.log(`Server is running on port ${Misc.PORT}`)
	})
})()
