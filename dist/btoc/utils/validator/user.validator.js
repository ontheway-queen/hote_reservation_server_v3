"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class BtocUserValidator {
    constructor() {
        this.updateProfile = joi_1.default.object({
            first_name: joi_1.default.string().max(100).optional(),
            last_name: joi_1.default.string().max(100).optional(),
            phone: joi_1.default.string().max(20).optional().allow(null, ""),
            date_of_birth: joi_1.default.date().optional().allow(null),
            gender: joi_1.default.string().valid("male", "female", "other").optional(),
            address: joi_1.default.string().max(1000).optional(),
            city_id: joi_1.default.number().integer().optional(),
            country_id: joi_1.default.number().integer().optional(),
        });
    }
}
exports.default = BtocUserValidator;
//# sourceMappingURL=user.validator.js.map