import { Request, Response, NextFunction } from 'express'
import { Status, Messages } from '../constants'
import { userRepository } from '../repositories'
import { setResponse } from '../utils'

export const authMiddleWare = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const userId = req.headers['x-user-id'] as string

	if (!userId) {
		return setResponse(res, {
			status: Status.FORBIDDEN,
			responseEntity: {
				data: null,
				error: {
					message: Messages.FORBIDDEN_MESSAGE,
				},
			},
		})
	}

	const user = userRepository.getUserById(userId)

	if (!user) {
		return setResponse(res, {
			status: Status.UNAUTHORIZED,
			responseEntity: {
				data: null,
				error: {
					message: Messages.UNAUTHORIZED_MESSAGE,
				},
			},
		})
	}

	return next()
}
