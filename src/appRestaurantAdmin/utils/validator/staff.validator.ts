import Joi from "joi";

class RestaurantStaffValidator {
	public getStaffsValidator = Joi.object({
		limit: Joi.number().optional(),
		skip: Joi.number().optional(),
		name: Joi.string().optional(),
	});
}

export default RestaurantStaffValidator;
