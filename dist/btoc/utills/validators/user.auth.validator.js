"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocUserAuthValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class BtocUserAuthValidator {
    constructor() {
        this.registrationValidator = joi_1.default.object({
            first_name: joi_1.default.string().max(100).required(),
            last_name: joi_1.default.string().max(100).required(),
            email: joi_1.default.string().email().max(255).required(),
            password: joi_1.default.string().min(6).max(20).required(),
            phone: joi_1.default.string().max(20).optional().allow(null, ""),
            date_of_birth: joi_1.default.date().optional().allow(null),
            gender: joi_1.default.string().valid("male", "female", "other").required(),
            address: joi_1.default.string().max(1000).required(),
            city_id: joi_1.default.number().integer().required(),
            country_id: joi_1.default.number().integer().required(),
        });
        this.loginValidator = joi_1.default.object({
            email: joi_1.default.string().email().max(255).required(),
            password: joi_1.default.string().min(6).max(20).required(),
        });
    }
}
exports.BtocUserAuthValidator = BtocUserAuthValidator;
//# sourceMappingURL=user.auth.validator.js.map