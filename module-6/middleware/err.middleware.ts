import { NextFunction, Request, Response } from 'express'
import { Messages, Status } from '../constants'

export const errMiddleware = (
	err: any,
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	console.error(err.message)
	console.error(err.stack)
	if (err)
		return res.status(Status.INTERVAL_SERVER_ERROR).send({
			data: null,
			error: { message: Messages.INTERNAL_SERVER_ERROR_MESSAGE },
		})
	next()
}

export const notFoundMiddleware = (_req: Request, res: Response) => {
	return res.status(Status.NOT_FOUND).send({
		data: null,
		error: { message: Messages.NOT_FOUND_MESSAGE },
	})
}

export const teapotMiddleware = (_req: Request, res: Response) => {
	return res.status(Status.I_AM_A_TEAPOT).send(Messages.I_AM_A_TEAPOT_MESSAGE)
}
