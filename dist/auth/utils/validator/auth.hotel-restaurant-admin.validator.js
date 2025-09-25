"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AuthHotelRestaurantAdminValidator {
    constructor() {
        this.updateProfileValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            phone: joi_1.default.string().allow("").optional(),
        });
        this.changePasswordValidator = joi_1.default.object({
            old_password: joi_1.default.string().required(),
            new_password: joi_1.default.string().required(),
        });
    }
}
exports.default = AuthHotelRestaurantAdminValidator;
//# sourceMappingURL=auth.hotel-restaurant-admin.validator.js.map