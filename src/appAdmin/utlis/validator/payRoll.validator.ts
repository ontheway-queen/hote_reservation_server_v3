import Joi from "joi";

class PayRollValidator {
  public CreatePayrollValidator = Joi.object({
    employee_id: Joi.number().required(),
    account_id: Joi.number().required(),
    basic_salary: Joi.number().required(),
    granted_leave_days: Joi.number().required().default(0),
    total_days: Joi.number().required(),
    total_attendance_days: Joi.number().required(),
    salary_date: Joi.string().required(),
    payroll_month: Joi.string().required(),
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
          return parsedObject;
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
          return parsedObject;
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
    payroll_month: Joi.string().allow("").optional(),
  });

  // Params id Validator
  public PayrollidValidator = Joi.object({
    id: Joi.number().required(),
  });

  public updatePayrollValidator = Joi.object({
    employee_id: Joi.number().optional(),
    account_id: Joi.number().optional(),
    basic_salary: Joi.number().optional(),
    salary_date: Joi.string().optional(),
    payroll_month: Joi.string().optional(),
    note: Joi.string().allow("").optional(),
    granted_leave_days: Joi.number().required().default(0),
    total_days: Joi.number().required(),
    total_attendance_days: Joi.number().required(),
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
          return parsedObject;
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
          return parsedObject;
        } catch (err) {
          return helpers.message({
            custom: "invalid allowances, should be a valid JSON Object",
          });
        }
      })
      .optional(),

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
          return parsedObject;
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
          return parsedObject;
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
          return parsedObject;
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
        return parsedObject;
      } catch (err) {
        return helpers.message({
          custom: "invalid allowances, should be a valid JSON Object",
        });
      }
    }),
  });
}
export default PayRollValidator;
