import Joi from "joi";

export class BtocUserAuthValidator {
	public registrationValidator = Joi.object({
		first_name: Joi.string().max(100).required(),
		last_name: Joi.string().max(100).required(),
		email: Joi.string().email().max(255).required(),
		password: Joi.string().min(6).max(20).required(),
		phone: Joi.string().max(20).optional().allow(null, ""),
		date_of_birth: Joi.date().optional().allow(null),
		gender: Joi.string().valid("male", "female", "other").required(),
		address: Joi.string().max(1000).required(),
		city_id: Joi.number().integer().required(),
		country_id: Joi.number().integer().required(),
	});

	public loginValidator = Joi.object({
		email: Joi.string().email().max(255).required(),
		password: Joi.string().min(6).max(20).required(),
	});
}
