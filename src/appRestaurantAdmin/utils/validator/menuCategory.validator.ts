import Joi from "joi";

class RestaurantMenuCategoryValidator {
	public createMenuCategoryValidator = Joi.object({
		name: Joi.string().required(),
	});

	public getMenuCategoriesValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		name: Joi.string().optional(),
		status: Joi.string().valid("available", "unavailable").optional(),
	});
}

export default RestaurantMenuCategoryValidator;
