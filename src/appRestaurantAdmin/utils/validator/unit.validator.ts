import Joi from "joi";

class RestaurantUnitsValidator {
	public createUnitValidator = Joi.object({
		name: Joi.string().required(),
		short_code: Joi.string().required(),
	});

	public getUnitValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		name: Joi.string().optional(),
		short_code: Joi.string().optional(),
	});

	public updateUnitValidator = Joi.object({
		name: Joi.string().optional(),
		short_code: Joi.string().optional(),
	});
}

export default RestaurantUnitsValidator;
