import { Router } from 'express'
import { cartController } from '../controllers'
import { validationMiddlewareFactory } from '../middlewares'
import { cartSchemas } from '../validators'

const cartRouter = Router()

cartRouter.get('/', cartController.getUsersCart)

cartRouter.put(
	'/',
	validationMiddlewareFactory(cartSchemas.cartUpdateSchema),
	cartController.updateCart
)

cartRouter.delete('/', cartController.emptyCart)

cartRouter.post('/checkout', cartController.createOrder)

export { cartRouter }
