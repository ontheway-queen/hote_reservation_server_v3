"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ExpenseValidator {
    constructor() {
        // create expense head validator
        this.createExpenseHeadValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        //update expense head validator
        this.UpdateExpenseHeadValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        // create expense validator
        this.createExpenseValidator = joi_1.default.object({
            expense_by: joi_1.default.number().required().messages({
                "any.required": "Expense By is required",
            }),
            expense_date: joi_1.default.string().required().messages({
                "any.required": "Expense Date is required",
            }),
            expense_note: joi_1.default.string().allow("").optional(),
            pay_method: joi_1.default.string()
                .valid("CASH", "BANK", "MOBILE_BANKING", "CHEQUE")
                .required(),
            account_id: joi_1.default.number().when("pay_method", {
                is: joi_1.default.valid("CASH", "BANK", "MOBILE_BANKING"),
                then: joi_1.default.number().required().messages({
                    "any.required": "Account ID is required when payment method is CASH, BANK or MOBILE_BANKING",
                }),
                otherwise: joi_1.default.optional(),
            }),
            cheque_no: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Check No is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            cheque_date: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Check Date is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            bank_name: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Bank Name is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            branch_name: joi_1.default.string().when("pay_method", {
                is: "CHEQUE",
                then: joi_1.default.required().messages({
                    "any.required": "Branch Name is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.optional(),
            }),
            transaction_no: joi_1.default.string().when("pay_method", {
                is: "MOBILE_BANKING",
                then: joi_1.default.required().messages({
                    "any.required": "Transaction No is required when payment method is MOBILE_BANKING",
                }),
                otherwise: joi_1.default.optional(),
            }),
            expense_items: joi_1.default.string().custom((value, helpers) => {
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid Expense Items: should be a valid JSON array",
                    });
                }
            }),
        });
        // get all room booking query validator
        this.getAllExpenseQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            key: joi_1.default.string().allow("").optional(),
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
        });
        this.updateExpenseValidator = joi_1.default.object({
            expense_by: joi_1.default.number().optional(),
            expense_date: joi_1.default.string().optional(),
            expense_note: joi_1.default.string().allow("").optional(),
            account_id: joi_1.default.when("pay_method", {
                is: joi_1.default.exist().valid("CASH", "BANK", "MOBILE_BANKING"),
                then: joi_1.default.number().required().messages({
                    "any.required": "Account ID is required when payment method is CASH, BANK or MOBILE_BANKING",
                }),
                otherwise: joi_1.default.number().optional(),
            }),
            pay_method: joi_1.default.string()
                .valid("CASH", "BANK", "MOBILE_BANKING", "CHEQUE")
                .optional(),
            cheque_no: joi_1.default.when("pay_method", {
                is: joi_1.default.exist().valid("CHEQUE"),
                then: joi_1.default.string().required().messages({
                    "any.required": "Check No is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.string().optional(),
            }),
            cheque_date: joi_1.default.when("pay_method", {
                is: joi_1.default.exist().valid("CHEQUE"),
                then: joi_1.default.string().required().messages({
                    "any.required": "Check Date is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.string().optional(),
            }),
            bank_name: joi_1.default.when("pay_method", {
                is: joi_1.default.exist().valid("CHEQUE"),
                then: joi_1.default.string().required().messages({
                    "any.required": "Bank Name is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.string().optional(),
            }),
            branch_name: joi_1.default.when("pay_method", {
                is: joi_1.default.exist().valid("CHEQUE"),
                then: joi_1.default.string().required().messages({
                    "any.required": "Branch Name is required when payment method is CHEQUE",
                }),
                otherwise: joi_1.default.string().optional(),
            }),
            expense_items: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid Expense Items: should be a valid JSON array",
                    });
                }
            })
                .optional(),
        });
    }
}
exports.default = ExpenseValidator;
//# sourceMappingURL=expense.validator.js.map