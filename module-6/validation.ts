import Joi from 'joi'

export const cartUpdateSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  // 0 takes the product out of the cart.
  count: Joi.number().integer().min(0).max(1000).required(),
})

/** The checkout body is optional; whatever is sent must have this shape. */
export const checkoutSchema = Joi.object({
  payment: Joi.object({
    type: Joi.string().required(),
    address: Joi.string().allow(''),
    creditCard: Joi.string().allow(''),
  }),
  delivery: Joi.object({
    type: Joi.string().required(),
    address: Joi.string().allow('').required(),
  }),
  comments: Joi.string().allow('').max(500),
}).default({})

/** Validates a body; unknown keys are dropped, every problem is listed in one message. */
export const validateBody = <T>(
  schema: Joi.Schema,
  body: unknown,
): { value: T } | { error: string } => {
  const { value, error } = schema.validate(body ?? {}, { abortEarly: false, stripUnknown: true })
  if (error) return { error: error.details.map((detail) => detail.message).join('; ') }
  return { value: value as T }
}
