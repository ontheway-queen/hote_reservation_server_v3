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
        // create Supplier validation
        this.createSupplierValidatorValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            phone: joi_1.default.number().allow("").optional(),
        });
        // get all Supplier query validator
        this.getAllSupplierQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        // update Supplier validation
        this.UpdateSupplierValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").optional(),
            phone: joi_1.default.number().allow("").optional(),
            status: joi_1.default.boolean().optional(),
        });
        this.supplierPayment = joi_1.default.object({
            acc_id: joi_1.default.number().required(),
            supplier_id: joi_1.default.number().required(),
            inv_id: joi_1.default.number().optional(),
            paid_amount: joi_1.default.number().required(),
            receipt_type: joi_1.default.string().allow("invoice", "overall").required(),
            remarks: joi_1.default.string().optional(),
            payment_date: joi_1.default.string().required(),
        });
    }
}
exports.default = HRconfigurationValidator;
//# sourceMappingURL=hrConfiguration.validator.js.map