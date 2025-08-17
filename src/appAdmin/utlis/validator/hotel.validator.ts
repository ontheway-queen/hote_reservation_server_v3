import Joi from "joi";

class HotelValidator {
	public updateHotelValidator = Joi.object({
		hotel_name: Joi.string().allow("").optional(),
		bin: Joi.string().allow("").optional(),
		description: Joi.string().allow("").optional(),
		address: Joi.string().allow("").optional(),
		postal_code: Joi.string()
			.lowercase()
			.trim()
			.allow("")
			.regex(/^\S/)
			.optional(),
		latitude: Joi.string().allow("").optional(),
		longitude: Joi.string().allow("").optional(),
		zip_code: Joi.string().trim().allow("").optional(),
		fax: Joi.string().trim().allow("").optional(),
		website_url: Joi.string().trim().allow("").optional(),
		phone: Joi.string().trim().allow("").optional(),
		optional_phone1: Joi.string().trim().allow("").optional(),
		// hotel_amnities: Joi.string()
		//   .custom((value, helpers) => {
		//     try {
		//       const parsedArray = JSON.parse(value);

		//       if (!Array.isArray(parsedArray)) {
		//         return helpers.message({
		//           custom:
		//             "invalid hotel_amnities, hotel_amnities will be json array of string",
		//         });
		//       }

		//       for (const item of parsedArray) {
		//         if (typeof item !== "string") {
		//           return helpers.message({
		//             custom:
		//               "invalid hotel_amnities array item type, item type will be string",
		//           });
		//         }
		//       }

		//       return value;
		//     } catch (err) {
		//       return helpers.message({
		//         custom:
		//           "invalid hotel_amnities, hotel_amnities will be json array of string",
		//       });
		//     }
		//   })
		//   .optional(),
		// remove_amnities: Joi.string()
		//   .custom((value, helpers) => {
		//     try {
		//       const parsedArray = JSON.parse(value);

		//       if (!Array.isArray(parsedArray)) {
		//         return helpers.message({
		//           custom:
		//             "invalid remove_amnities, remove_amnities will be json array of number",
		//         });
		//       }

		//       for (const item of parsedArray) {
		//         if (typeof item !== "number") {
		//           return helpers.message({
		//             custom:
		//               "invalid remove_amnities array item type, item type will be number",
		//           });
		//         }
		//       }

		//       return value;
		//     } catch (err) {
		//       return helpers.message({
		//         custom:
		//           "invalid remove_amnities, remove_amnities will be json array of number",
		//       });
		//     }
		//   })
		//   .optional(),
		remove_hotel_images: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsedArray = JSON.parse(value);

					if (!Array.isArray(parsedArray)) {
						return helpers.message({
							custom: "invalid remove_photo, remove_photo will be json array of number",
						});
					}

					for (const item of parsedArray) {
						if (typeof item !== "number") {
							return helpers.message({
								custom: "invalid remove_photo array item type, item type will be number",
							});
						}
					}

					return value;
				} catch (err) {
					return helpers.message({
						custom: "invalid remove_photo, remove_photo will be json array of number",
					});
				}
			})

			.optional(),
	});
}

export default HotelValidator;
