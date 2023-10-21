import { Router } from 'express'
import { productController } from '../controllers'

const productsRouter = Router()

productsRouter.get('/', productController.getProducts)

productsRouter.get('/:productId', productController.getProductById)

export { productsRouter }
