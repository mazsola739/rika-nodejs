import { Request, Response, NextFunction } from 'express'
import Joi, { ObjectSchema } from 'joi'
import { Status } from '../constants'

export const validationMiddlewareFactory = (
	schema: ObjectSchema = Joi.object({})
): ((req: Request, res: Response, next: NextFunction) => void) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.body)

		const valid = error == null

		if (valid) {
			next()
		} else {
			const { details } = error
			const message = details.map((i) => i.message).join(',')
			console.log('error', message)

			res.status(Status.BAD_REQUEST).json({ error: message })
		}
	}
}
