import Joi from "joi";

class ExpenseValidator {
  // create expense head validator
  createExpenseHeadValidator = Joi.object({
    name: Joi.string().required(),
  });

  //update expense head validator
  UpdateExpenseHeadValidator = Joi.object({
    name: Joi.string().required(),
  });

  // create expense validator
  public createExpenseValidator = Joi.object({
    expense_by: Joi.number().required().messages({
      "any.required": "Expense By is required",
    }),

    expense_date: Joi.string().required().messages({
      "any.required": "Expense Date is required",
    }),

    expense_note: Joi.string().allow("").optional(),
    pay_method: Joi.string()
      .valid("CASH", "BANK", "MOBILE_BANKING", "CHEQUE")
      .required(),

    account_id: Joi.number().when("pay_method", {
      is: Joi.valid("CASH", "BANK", "MOBILE_BANKING"),
      then: Joi.number().required().messages({
        "any.required":
          "Account ID is required when payment method is CASH, BANK or MOBILE_BANKING",
      }),
      otherwise: Joi.optional(),
    }),

    cheque_no: Joi.string().when("pay_method", {
      is: "CHEQUE",
      then: Joi.required().messages({
        "any.required": "Check No is required when payment method is CHEQUE",
      }),
      otherwise: Joi.optional(),
    }),

    cheque_date: Joi.string().when("pay_method", {
      is: "CHEQUE",
      then: Joi.required().messages({
        "any.required": "Check Date is required when payment method is CHEQUE",
      }),
      otherwise: Joi.optional(),
    }),

    bank_name: Joi.string().when("pay_method", {
      is: "CHEQUE",
      then: Joi.required().messages({
        "any.required": "Bank Name is required when payment method is CHEQUE",
      }),
      otherwise: Joi.optional(),
    }),

    branch_name: Joi.string().when("pay_method", {
      is: "CHEQUE",
      then: Joi.required().messages({
        "any.required": "Branch Name is required when payment method is CHEQUE",
      }),
      otherwise: Joi.optional(),
    }),

    transaction_no: Joi.string().when("pay_method", {
      is: "MOBILE_BANKING",
      then: Joi.required().messages({
        "any.required":
          "Transaction No is required when payment method is MOBILE_BANKING",
      }),
      otherwise: Joi.optional(),
    }),

    expense_items: Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          return helpers.message({
            custom: "Invalid Expense Items: should be an array of objects",
          });
        }

        // validate each item inside array
        for (const item of parsed) {
          if (item.id && typeof item.id !== "number") {
            return helpers.message({
              custom: "Each expense item must have a numeric id",
            });
          }
          if (item.remarks && typeof item.remarks !== "string") {
            return helpers.message({
              custom: "Each expense item must have a string remarks",
            });
          }
          if (typeof item.amount !== "number") {
            return helpers.message({
              custom: "Each expense item must have a numeric amount",
            });
          }
        }

        return parsed;
      } catch (err) {
        return helpers.message({
          custom: "Invalid Expense Items: should be a valid JSON array",
        });
      }
    }),
  });

  // get all room booking query validator
  public getAllExpenseQueryValidator = Joi.object({
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
    key: Joi.string().allow("").optional(),
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
  });

  public updateExpenseValidator = Joi.object({
    expense_by: Joi.number().optional(),
    expense_date: Joi.string().optional(),
    expense_note: Joi.string().allow("").optional(),
    account_id: Joi.when("pay_method", {
      is: Joi.exist().valid("CASH", "BANK", "MOBILE_BANKING"),
      then: Joi.number().required().messages({
        "any.required":
          "Account ID is required when payment method is CASH, BANK or MOBILE_BANKING",
      }),
      otherwise: Joi.number().optional(),
    }),

    pay_method: Joi.string()
      .valid("CASH", "BANK", "MOBILE_BANKING", "CHEQUE")
      .optional(),

    cheque_no: Joi.when("pay_method", {
      is: Joi.exist().valid("CHEQUE"),
      then: Joi.string().required().messages({
        "any.required": "Check No is required when payment method is CHEQUE",
      }),
      otherwise: Joi.string().optional(),
    }),

    cheque_date: Joi.when("pay_method", {
      is: Joi.exist().valid("CHEQUE"),
      then: Joi.string().required().messages({
        "any.required": "Check Date is required when payment method is CHEQUE",
      }),
      otherwise: Joi.string().optional(),
    }),

    bank_name: Joi.when("pay_method", {
      is: Joi.exist().valid("CHEQUE"),
      then: Joi.string().required().messages({
        "any.required": "Bank Name is required when payment method is CHEQUE",
      }),
      otherwise: Joi.string().optional(),
    }),

    branch_name: Joi.when("pay_method", {
      is: Joi.exist().valid("CHEQUE"),
      then: Joi.string().required().messages({
        "any.required": "Branch Name is required when payment method is CHEQUE",
      }),
      otherwise: Joi.string().optional(),
    }),

    expense_items: Joi.string()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);

          if (!Array.isArray(parsed)) {
            return helpers.message({
              custom: "Invalid Expense Items: should be an array of objects",
            });
          }

          // validate each item inside array
          for (const item of parsed) {
            console.log({ item });
            if (item.id && typeof item.id !== "number") {
              return helpers.message({
                custom: "Each expense item must have a numeric id",
              });
            }
            if (item.remarks && typeof item.remarks !== "string") {
              return helpers.message({
                custom: "Each expense item must have a string remarks",
              });
            }
            if (typeof item.amount !== "number") {
              return helpers.message({
                custom: "Each expense item must have a numeric amount",
              });
            }
            if (item.is_deleted && typeof item.is_deleted !== "number") {
              return helpers.message({
                custom: "Each expense item must have 0 or 1",
              });
            }
          }

          return parsed; // ✅ will pass parsed array to `req.body`
        } catch (err) {
          return helpers.message({
            custom: "Invalid Expense Items: should be a valid JSON array",
          });
        }
      })
      .optional(),
  });
}
export default ExpenseValidator;
