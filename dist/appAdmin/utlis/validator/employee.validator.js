"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class EmployeeValidator {
    constructor() {
        this.createEmployeeValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").required(),
            department_id: joi_1.default.number().required(),
            designation_id: joi_1.default.array().items(joi_1.default.number()).required(),
            blood_group: joi_1.default.number().optional(),
            salary: joi_1.default.number().optional(),
            email: joi_1.default.string().allow("").optional(),
            contact_no: joi_1.default.string().allow("").required(),
            dob: joi_1.default.string().optional(),
            appointment_date: joi_1.default.string().optional(),
            joining_date: joi_1.default.string().optional(),
            address: joi_1.default.string().allow("").optional(),
        });
        this.getAllEmployeeQueryValidator = joi_1.default.object({
            status: joi_1.default.string().valid("0", "1"),
            category: joi_1.default.string().allow("").optional(),
            key: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            department: joi_1.default.string().allow("").optional(),
            designation: joi_1.default.string().allow("").optional(),
        });
        this.updateEmployeeValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").optional(),
            department_id: joi_1.default.number().optional(),
            res_id: joi_1.default.number().allow("").optional(),
            designation_id: joi_1.default.number().optional(),
            blood_group: joi_1.default.number().optional(),
            salary: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            mobile_no: joi_1.default.string().allow("").optional(),
            dob: joi_1.default.string().optional(),
            appointment_date: joi_1.default.string().optional(),
            joining_date: joi_1.default.string().optional(),
            address: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = EmployeeValidator;
//# sourceMappingURL=employee.validator.js.map