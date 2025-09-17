import Joi from "joi";

class InventoryValidator {
	public getInventoryDetailsValidator = Joi.object({
		key: Joi.string().allow("").optional(),
		limit: Joi.string().allow("").optional(),
		skip: Joi.string().allow("").optional(),
	});
}
export default InventoryValidator;
