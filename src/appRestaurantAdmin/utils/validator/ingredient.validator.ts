import Joi from "joi";

class RestaurantIngredientValidator {
	public createIngredientValidator = Joi.object({
		name: Joi.string().required(),
		measurement_id: Joi.number().required(),
	});

	public getIngredientsValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		name: Joi.string().optional(),
	});

	public updateIngredientValidator = Joi.object({
		name: Joi.string().optional(),
		measurement_id: Joi.number().optional(),
	});
}

export default RestaurantIngredientValidator;
