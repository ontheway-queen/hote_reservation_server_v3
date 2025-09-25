import Joi from "joi";

class AuthHotelRestaurantAdminValidator {
	public updateProfileValidator = Joi.object({
		name: Joi.string().optional(),
		phone: Joi.string().allow("").optional(),
	});

	public changePasswordValidator = Joi.object({
		old_password: Joi.string().required(),
		new_password: Joi.string().required(),
	});
}

export default AuthHotelRestaurantAdminValidator;
