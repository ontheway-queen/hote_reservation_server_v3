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
            ac_tr_ac_id: joi_1.default.number().required(),
            attendance_days: joi_1.default.number().optional(),
            salary_date: joi_1.default.string().required(),
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
                    return value;
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
                    return value;
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid allowances, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
            service_charge: joi_1.default.number().min(0).max(100).required(),
        });
        // get all Pay Roll query validator
        this.getAllPayRollValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            key: joi_1.default.string().allow("").optional(),
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
        });
        // Params id Validator
        this.PayrollidValidator = joi_1.default.object({
            id: joi_1.default.number().required(),
        });
    }
}
exports.default = PayRollValidator;
//# sourceMappingURL=payRoll.validator.js.map