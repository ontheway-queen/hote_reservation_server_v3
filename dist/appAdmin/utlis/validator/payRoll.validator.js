"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class PayRollValidator {
    constructor() {
        this.CreatePayrollValidator = joi_1.default.object({
            employee_id: joi_1.default.number().required(),
            account_id: joi_1.default.number().required(),
            basic_salary: joi_1.default.number().required(),
            granted_leave_days: joi_1.default.number().required().default(0),
            total_days: joi_1.default.number().required(),
            total_attendance_days: joi_1.default.number().required(),
            salary_date: joi_1.default.string().required(),
            payroll_month: joi_1.default.string().required(),
            note: joi_1.default.string().allow("").optional(),
            deductions: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid deductions, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
            allowances: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid allowances, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
        });
        // get all Pay Roll query validator
        this.getAllPayRollValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            key: joi_1.default.string().allow("").optional(),
            payroll_month: joi_1.default.string().allow("").optional(),
        });
        // Params id Validator
        this.PayrollidValidator = joi_1.default.object({
            id: joi_1.default.number().required(),
        });
        this.updatePayrollValidator = joi_1.default.object({
            employee_id: joi_1.default.number().optional(),
            account_id: joi_1.default.number().optional(),
            basic_salary: joi_1.default.number().optional(),
            salary_date: joi_1.default.string().optional(),
            payroll_month: joi_1.default.string().optional(),
            note: joi_1.default.string().allow("").optional(),
            granted_leave_days: joi_1.default.number().required().default(0),
            total_days: joi_1.default.number().required(),
            total_attendance_days: joi_1.default.number().required(),
            deductions: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid deductions, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
            allowances: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid allowances, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
            add_deductions: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid deductions, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
            delete_deductions: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid delete deductions, should be a valid JSON Object",
                    });
                }
            }),
            add_allowances: joi_1.default.string()
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
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid allowances, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
            delete_allowances: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedObject = JSON.parse(value);
                    const otherType = typeof parsedObject;
                    if (otherType !== "object") {
                        return helpers.message({
                            custom: "invalid allowances, should be a JSON object",
                        });
                    }
                    return parsedObject;
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid allowances, should be a valid JSON Object",
                    });
                }
            }),
        });
    }
}
exports.default = PayRollValidator;
//# sourceMappingURL=payRoll.validator.js.map