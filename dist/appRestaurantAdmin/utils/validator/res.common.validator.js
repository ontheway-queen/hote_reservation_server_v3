"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantCommonValidator {
    constructor() {
        this.getAllAccountQueryValidator = joi_1.default.object({
            ac_type: joi_1.default.string()
                .lowercase()
                .valid("bank", "cash", "cheque", "mobile_banking", "card")
                .optional(),
            key: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = RestaurantCommonValidator;
//# sourceMappingURL=res.common.validator.js.map