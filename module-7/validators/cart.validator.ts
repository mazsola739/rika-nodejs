import Joi from 'joi'

const cartUpdateSchema = Joi.object({
	productId: Joi.string().uuid().required(),
	count: Joi.number().integer().min(1).required(),
})

const cartItemSchema = Joi.object({
	product: Joi.object({
		id: Joi.string().uuid().required(),
		title: Joi.string().required(),
		description: Joi.string().required(),
		price: Joi.number().precision(2).min(0).required(),
	}).required(),
	count: Joi.number().integer().min(1).required(),
})

const cartSchema = Joi.object({
	userId: Joi.string().uuid().required(),
	items: Joi.array().items(cartItemSchema).required(),
})

const checkoutSchema = Joi.object({
	payment: Joi.object({
		type: Joi.string().required(),
		address: Joi.string(),
		creditCard: Joi.string(),
	}),
	delivery: Joi.object({
		type: Joi.string().required(),
		address: Joi.string().required(),
	}),
	comments: Joi.string().required(),
})

export const cartSchemas = {
	cartUpdateSchema,
	cartItemSchema,
	cartSchema,
	checkoutSchema,
}
