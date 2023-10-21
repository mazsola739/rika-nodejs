import { Messages, Status } from '../constants'
import { Request, Response } from 'express'
import { setResponse, setServerError } from '../utils'
import { cartService } from '../services'

const getUsersCart = (req: Request, res: Response) => {
	try {
		const userCart = cartService.getCart(req)
		setResponse(res, {
			responseEntity: {
				data: {
					userCart,
				},
				error: null,
			},
			status: Status.OK,
		})
	} catch (error) {
		setServerError(res)
	}
}

const updateCart = (req: Request, res: Response) => {
	try {
		const [updatedCart, cartServiceError] = cartService.updateCart(req)

		if (updatedCart) {
			return res.status(Status.OK).json(updatedCart)
		}
		return res
			.status(Status.BAD_REQUEST)
			.json({ error: cartServiceError.message })
	} catch (error) {
		return res
			.status(Status.INTERVAL_SERVER_ERROR)
			.json({ error: Messages.INTERNAL_SERVER_ERROR_MESSAGE })
	}
}

const emptyCart = (req: Request, res: Response): void => {
	try {
		const emptiedCart = cartService.emptyCart(req)

		if (emptiedCart) {
			res.status(Status.OK).json(emptiedCart)
		} else {
			res
				.status(Status.NOT_FOUND)
				.json({ error: Messages.CART_NOT_FOUND_MESSAGE })
		}
	} catch (error) {
		res
			.status(Status.INTERVAL_SERVER_ERROR)
			.json({ error: Messages.INTERNAL_SERVER_ERROR_MESSAGE })
	}
}

const createOrder = (req: Request, res: Response) => {
	try {
		const [order, error] = cartService.createOrder(req)

		if (order) {
			return res.status(Status.CREATED).json(order)
		}

		return res.status(Status.BAD_REQUEST).json({ error: error.message })
	} catch (error) {
		return res
			.status(Status.INTERVAL_SERVER_ERROR)
			.json({ error: Messages.INTERNAL_SERVER_ERROR_MESSAGE })
	}
}

export const cartController = {
	getUsersCart,
	updateCart,
	emptyCart,
	createOrder,
}
