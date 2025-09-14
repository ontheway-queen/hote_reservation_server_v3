"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class CommonInvValidator {
    constructor() {
        //=================== Common Modules ======================//
        // create Common validation
        this.createCommonModuleValidator = joi_1.default.object({
            name: joi_1.default.string().messages({
                "string.base": "Name must be a string",
            }),
            short_code: joi_1.default.string().when(joi_1.default.ref("$short_code_exists"), {
                is: true,
                then: joi_1.default.required().messages({
                    "any.required": "Short code cannot be empty",
                }),
                otherwise: joi_1.default.optional(),
            }),
        });
        // get all Common query validator
        this.getAllCommonModuleQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
        });
        // update Common validation
        this.UpdateCommonModuleValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").optional(),
            short_code: joi_1.default.string().allow("").optional(),
            status: joi_1.default.number().valid(0, 1).optional(),
        });
        //=================== Supplier ======================//
        // create Supplier validation
        this.createSupplierValidatorValidator = joi_1.default.object({
            name: joi_1.default.string().uppercase().required(),
            phone: joi_1.default.number().allow("").required(),
            last_balance: joi_1.default.number().required(),
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
            last_balance: joi_1.default.number().optional(),
        });
    }
}
exports.default = CommonInvValidator;
//# sourceMappingURL=common.inv.validator.js.map