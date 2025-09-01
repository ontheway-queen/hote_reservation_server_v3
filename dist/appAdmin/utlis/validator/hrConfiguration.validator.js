"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HRconfigurationValidator {
    constructor() {
        this.createShift = joi_1.default.object({
            name: joi_1.default.string().required(),
            start_time: joi_1.default.string().required(),
            end_time: joi_1.default.string().required(),
        });
        this.updateShift = joi_1.default.object({
            name: joi_1.default.string().optional(),
            start_time: joi_1.default.string().optional(),
            end_time: joi_1.default.string().optional(),
        });
        this.createAllowances = joi_1.default.object({
            name: joi_1.default.string().required(),
            type: joi_1.default.string().allow("percentage", "fixed").required(),
            value: joi_1.default.number().required(),
            is_taxable: joi_1.default.bool().required(),
        });
        this.updateAllowances = joi_1.default.object({
            name: joi_1.default.string().optional(),
            type: joi_1.default.string().allow("percentage", "fixed").optional(),
            value: joi_1.default.number().optional(),
            is_taxable: joi_1.default.bool().optional(),
        });
        this.createDeductions = joi_1.default.object({
            name: joi_1.default.string().required(),
            type: joi_1.default.string().allow("percentage", "fixed").required(),
            value: joi_1.default.number().required(),
        });
        this.updateDeduction = joi_1.default.object({
            name: joi_1.default.string().optional(),
            type: joi_1.default.string().allow("percentage", "fixed").optional(),
            value: joi_1.default.number().optional(),
        });
    }
}
exports.default = HRconfigurationValidator;
//# sourceMappingURL=hrConfiguration.validator.js.map