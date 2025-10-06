import Joi from "joi";

class RestaurantOrderValidator {
	public createOrderValidator = Joi.object({
		staff_id: Joi.number().integer().optional(),

		order_type: Joi.string()
			.valid("in-dine", "takeout", "delivery")
			.required(),

		guest: Joi.string().optional(),
		table_id: Joi.number().integer().required(),
		sub_total: Joi.number().precision(2).required(),
		discount: Joi.number().precision(2).optional().default(0),
		discount_type: Joi.string()
			.valid("percentage", "fixed")
			.optional()
			.default(null),
		net_total: Joi.number().precision(2).required(),
		service_charge: Joi.number().precision(2).required(),
		service_charge_type: Joi.string()
			.valid("percentage", "fixed")
			.required(),
		vat_rate: Joi.number().precision(2).required(),
		grand_total: Joi.number().precision(2).required(),
		room_no: Joi.number().optional().default(null),
		order_items: Joi.array()
			.items(
				Joi.object({
					food_id: Joi.number().integer().required(),
					quantity: Joi.number().integer().min(1).required(),
				})
			)
			.min(1)
			.required(),
	});

	public completeOrderPaymentValidator = Joi.object({
		payable_amount: Joi.number().precision(2).required(),
	});

	public updateOrderValidator = Joi.object({
		staff_id: Joi.number().integer().optional(),

		order_type: Joi.string()
			.valid("in-dine", "takeout", "delivery")
			.required(),

		customer: Joi.string()
			.pattern(/^(?:\+8801|01)[3-9]\d{8}$/)
			.required()
			.messages({
				"string.pattern.base":
					"Customer must be a valid Bangladeshi phone number",
			}),
		total: Joi.number().precision(2).required(),
		service_charge: Joi.number().precision(2).required(),
		service_charge_type: Joi.string()
			.valid("percentage", "fixed")
			.required(),
		discount: Joi.number().precision(2).optional().default(null),
		discount_type: Joi.string()
			.valid("percentage", "fixed")
			.optional()
			.default(null),
		vat_rate: Joi.number().precision(2).required(),
		sub_total: Joi.number().precision(2).required(),
		grand_total: Joi.number().precision(2).required(),
		room_no: Joi.number().optional().default(null),
		order_items: Joi.array()
			.items(
				Joi.object({
					food_id: Joi.number().integer().required(),
					quantity: Joi.number().integer().min(1).required(),
				})
			)
			.min(1)
			.required(),
	});
}

export default RestaurantOrderValidator;
