import Joi from "joi";

class PayRollValidator {
	public CreatePayrollValidator = Joi.object({
		employee_id: Joi.number().required(),
		ac_tr_ac_id: Joi.number().required(),
		attendance_days: Joi.number().optional(),
		salary_date: Joi.string().required(),
		note: Joi.string().allow("").optional(),
		deductions: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsedObject = JSON.parse(value);
					const deductionType = typeof parsedObject;
					if (deductionType !== "object") {
						return helpers.message({
							custom: "invalid deductions, should be a JSON object",
						});
					}
					return value;
				} catch (err) {
					return helpers.message({
						custom: "invalid deductions, should be a valid JSON Object",
					});
				}
			})
			.optional(),
		allowances: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsedObject = JSON.parse(value);
					const otherType = typeof parsedObject;
					if (otherType !== "object") {
						return helpers.message({
							custom: "invalid allowances, should be a JSON object",
						});
					}
					return value;
				} catch (err) {
					return helpers.message({
						custom: "invalid allowances, should be a valid JSON Object",
					});
				}
			})
			.optional(),
		service_charge: Joi.number().min(0).max(100).required(),
	});

	// get all Pay Roll query validator
	public getAllPayRollValidator = Joi.object({
		limit: Joi.string().allow("").optional(),
		skip: Joi.string().allow("").optional(),
		key: Joi.string().allow("").optional(),
		from_date: Joi.string().allow("").optional(),
		to_date: Joi.string().allow("").optional(),
	});

	// Params id Validator
	public PayrollidValidator = Joi.object({
		id: Joi.number().required(),
	});
}
export default PayRollValidator;
