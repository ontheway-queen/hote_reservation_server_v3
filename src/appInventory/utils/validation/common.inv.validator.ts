import Joi from "joi";

class CommonInvValidator {
	//=================== Common Modules ======================//

	// create Common validation
	public createCommonModuleValidator = Joi.object({
		name: Joi.string().messages({
			"string.base": "Name must be a string",
		}),
		short_code: Joi.string().when(Joi.ref("$short_code_exists"), {
			is: true,
			then: Joi.required().messages({
				"any.required": "Short code cannot be empty",
			}),
			otherwise: Joi.optional(),
		}),
	});

	// get all Common query validator
	public getAllCommonModuleQueryValidator = Joi.object({
		limit: Joi.string().allow("").optional(),
		skip: Joi.string().allow("").optional(),
		name: Joi.string().allow("").optional(),
		status: Joi.string().allow("").optional(),
	});

	// update Common validation
	public UpdateCommonModuleValidator = Joi.object({
		name: Joi.string().allow("").optional(),
		short_code: Joi.string().allow("").optional(),
		status: Joi.number().valid(0, 1).optional(),
	});

	//=================== Supplier ======================//

	// create Supplier validation
	public createSupplierValidatorValidator = Joi.object({
		name: Joi.string().uppercase().required(),
		phone: Joi.number().allow("").required(),
		last_balance: Joi.number().required(),
	});

	// get all Supplier query validator
	public getAllSupplierQueryValidator = Joi.object({
		limit: Joi.string().allow("").optional(),
		skip: Joi.string().allow("").optional(),
		name: Joi.string().allow("").optional(),
		status: Joi.string().allow("").optional(),
	});

	// update Supplier validation
	public UpdateSupplierValidator = Joi.object({
		name: Joi.string().allow("").optional(),
		phone: Joi.number().allow("").optional(),
		status: Joi.boolean().optional(),
		last_balance: Joi.number().optional(),
	});
}
export default CommonInvValidator;
