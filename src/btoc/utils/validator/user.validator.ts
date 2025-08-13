import Joi from "joi";

export default class BtocUserValidator {
	public updateProfile = Joi.object({
		first_name: Joi.string().max(100).optional(),
		last_name: Joi.string().max(100).optional(),
		phone: Joi.string().max(20).optional().allow(null, ""),
		date_of_birth: Joi.date().optional().allow(null),
		gender: Joi.string().valid("male", "female", "other").optional(),
		address: Joi.string().max(1000).optional(),
		city_id: Joi.number().integer().optional(),
		country_id: Joi.number().integer().optional(),
	});
}
