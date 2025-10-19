import Joi from "joi";

class HotelRestaurantValidator {
	public createRestaurantValidator = Joi.object({
		user: Joi.string().custom((value, helpers) => {
			try {
				const parsed = JSON.parse(value);
				const userType = typeof parsed;
				if (userType !== "object") {
					return helpers.message({
						custom: "Invalid user, should be a JSON object",
					});
				}
				console.log({ user: parsed });
				return parsed;
			} catch (err) {
				return helpers.message({
					custom: "Invalid user, should be a valid JSON Object",
				});
			}
		}),
		restaurant: Joi.string().custom((value, helpers) => {
			try {
				const parsed = JSON.parse(value);
				const restaurentType = typeof parsed;
				if (restaurentType !== "object") {
					return helpers.message({
						custom: "Invalid restaurent, should be a JSON object",
					});
				}
				console.log({ restaurant: parsed });
				return parsed;
			} catch (err) {
				return helpers.message({
					custom: "Invalid restaurent, should be a valid JSON Object",
				});
			}
		}),

		staffs: Joi.string().custom((value, helpers) => {
			try {
				const parsed = JSON.parse(value);
				const restaurentType = typeof parsed;
				if (!Array.isArray(parsed)) {
					return helpers.message({
						custom: "Invalid staffs. Expected an array of numbers",
					});
				}
				return parsed;
			} catch (err) {
				return helpers.message({
					custom: "Invalid staffs.",
				});
			}
		}),
	});

	public updateHotelRestaurantValidator = Joi.object({
		user: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsed = JSON.parse(value);
					const userType = typeof parsed;
					if (userType !== "object") {
						return helpers.message({
							custom: "Invalid user, should be a JSON object",
						});
					}
					return parsed;
				} catch (err) {
					return helpers.message({
						custom: "Invalid user, should be a valid JSON Object",
					});
				}
			})
			.optional(),
		restaurant: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsed = JSON.parse(value);
					const restaurentType = typeof parsed;
					if (restaurentType !== "object") {
						return helpers.message({
							custom: "Invalid restaurent, should be a JSON object",
						});
					}
					return parsed;
				} catch (err) {
					return helpers.message({
						custom: "Invalid restaurent, should be a valid JSON Object",
					});
				}
			})
			.optional(),
	});

	public getAllRestaurantQueryValidator = Joi.object({
		limit: Joi.string().allow("").optional(),
		skip: Joi.string().allow("").optional(),
		key: Joi.string().allow("").optional(),
	});

	public removeStaffValidator = Joi.object({
		staff_id: Joi.number().integer().required(),
		restaurant_id: Joi.number().integer().required(),
	});
}
export default HotelRestaurantValidator;
