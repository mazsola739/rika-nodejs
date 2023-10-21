import { Request, Response } from 'express'
import { Messages, Status } from '../constants'
import * as productService from '../services'
import { setResponse, setServerError } from '../utils'

const getProducts = (req: Request, res: Response) => {
	const products = productService.getProducts()

	try {
		return setResponse(res, {
			responseEntity: {
				data: {
					products,
				},
				error: null,
			},
			status: Status.OK,
		})
	} catch (error) {
		console.warn(`exception in product controller: ${error}`)
		return setServerError(res)
	}
}

const getProductById = (req: Request, res: Response) => {
	try {
		const productId = req.params.productId
		const product = productService.getProductById(productId)

		if (product) {
			return setResponse(res, {
				responseEntity: {
					data: {
						product,
					},
					error: null,
				},
				status: Status.OK,
			})
		}

		return setResponse(res, {
			responseEntity: {
				data: null,
				error: {
					message: Messages.PRODUCT_NOT_FOUND_MESSAGE,
				},
			},
			status: Status.NOT_FOUND,
		})
	} catch (error) {
		return setServerError(res)
	}
}

export const productController = { getProducts, getProductById }
