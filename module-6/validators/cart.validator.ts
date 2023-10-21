import Joi from 'joi'

const cartUpdateSchema = Joi.object({
	productId: Joi.string().uuid().required(),
	count: Joi.number().integer().min(1).required(),
})

export const cartSchemas = { cartUpdateSchema }
