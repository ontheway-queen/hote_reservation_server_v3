import Joi from "joi";

class RestaurantMeasurementsValidator {
	public createMeasurementsValidator = Joi.object({
		name: Joi.string().required(),
		short_code: Joi.string().required(),
	});

	public getMenuCategoriesValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		name: Joi.string().optional(),
		short_code: Joi.string().optional(),
	});

	public updateMeasurementsValidator = Joi.object({
		name: Joi.string().optional(),
		short_code: Joi.string().optional(),
	});
}

export default RestaurantMeasurementsValidator;
