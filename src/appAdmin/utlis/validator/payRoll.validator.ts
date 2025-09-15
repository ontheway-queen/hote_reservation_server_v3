import Joi from "joi";

class PayRollValidator {
	public CreatePayrollValidator = Joi.object({
		employee_id: Joi.number().required(),
		account_id: Joi.number().required(),
		payment_method: Joi.string()
			.required()
			.valid("BANK", "CASH", "MOBILE_BANKING"),
		basic_salary: Joi.number().required(),
		salary_basis: Joi.string().required().valid("calendar", "working"),
		leave_days: Joi.number().optional(),
		unpaid_leave_days: Joi.number().optional(),
		unpaid_leave_deduction: Joi.number().optional(),

		total_days: Joi.number().required(),
		payable_days: Joi.number().required(),
		daily_rate: Joi.number().required(),
		gross_salary: Joi.number().required(),
		net_salary: Joi.number().required(),
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

	public updatePayrollValidator = Joi.object({
		employee_id: Joi.number().optional(),
		account_id: Joi.number().optional(),
		payment_method: Joi.string()
			.optional()
			.valid("BANK", "CASH", "MOBILE_BANKING"),
		basic_salary: Joi.number().optional(),
		salary_basis: Joi.string().optional().valid("calendar", "working"),
		leave_days: Joi.number().optional(),
		unpaid_leave_days: Joi.number().optional(),
		unpaid_leave_deduction: Joi.number().optional(),

		total_days: Joi.number().optional(),
		payable_days: Joi.number().optional(),
		daily_rate: Joi.number().optional(),
		gross_salary: Joi.number().optional(),
		net_salary: Joi.number().optional(),
		salary_date: Joi.string().optional(),

		note: Joi.string().allow("").optional(),

		add_deductions: Joi.string()
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
		delete_deductions: Joi.string()
			.allow("")
			.custom((value, helpers) => {
				try {
					const parsedObject = JSON.parse(value);
					const deductionType = typeof parsedObject;
					if (deductionType !== "object") {
						return helpers.message({
							custom: "invalid delete deductions, should be a JSON object",
						});
					}
					return value;
				} catch (err) {
					return helpers.message({
						custom: "invalid delete deductions, should be a valid JSON Object",
					});
				}
			}),
		add_allowances: Joi.string()
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

		delete_allowances: Joi.string().custom((value, helpers) => {
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
		}),
	});
}
export default PayRollValidator;
