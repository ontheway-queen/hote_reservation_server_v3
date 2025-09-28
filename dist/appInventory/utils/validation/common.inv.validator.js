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
    }
}
exports.default = CommonInvValidator;
//# sourceMappingURL=common.inv.validator.js.map