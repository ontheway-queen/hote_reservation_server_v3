import Joi from "joi";

class RestaurantFoodValidator {
	public createFoodValidator = Joi.object({
		food: Joi.string()
			.required()
			.custom((value, helper) => {
				let parsed;
				try {
					parsed = JSON.parse(value);
				} catch {
					return helper.error("any.invalid");
				}

				const schema = Joi.object({
					name: Joi.string().required(),
					menu_category_id: Joi.number().required(),
					retail_price: Joi.number().required(),
					measurement_per_unit: Joi.number().required(),
					unit_id: Joi.number().required(),
				});

				const { error, value: validated } = schema.validate(parsed);
				if (error) return helper.error("any.invalid");

				return validated;
			}),
	});

	public getFoodsValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		name: Joi.string().optional(),
		category_id: Joi.number().optional(),
	});

	public updateFoodValidator = Joi.object({
		food: Joi.string()
			.optional()
			.custom((value, helper) => {
				let parsed;
				try {
					parsed = JSON.parse(value);
				} catch {
					return helper.error("any.invalid");
				}

				const schema = Joi.object({
					name: Joi.string().optional(),
					menu_category_id: Joi.number().optional(),
					retail_price: Joi.number().optional(),
					measurement_per_unit: Joi.number().optional(),
					unit_id: Joi.number().optional(),
					status: Joi.string()
						.valid("available", "unavailable")
						.optional(),
				});

				const { error, value: validated } = schema.validate(parsed);
				if (error) return helper.error("any.invalid");

				return validated;
			}),
	});
}

export default RestaurantFoodValidator;
