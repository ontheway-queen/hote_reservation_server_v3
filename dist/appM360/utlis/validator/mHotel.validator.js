"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class MHotelValidator {
    constructor() {
        // create hotel input validator
        this.createHotelValidator = joi_1.default.object({
            hotel_name: joi_1.default.string().required(),
            hotel_email: joi_1.default.string()
                .email()
                .lowercase()
                .trim()
                .regex(/^\S/)
                .required(),
            description: joi_1.default.string().allow("").optional(),
            accommodation_type_id: joi_1.default.number().required(),
            chain_name: joi_1.default.string().allow("").optional(),
            latitude: joi_1.default.string().required(),
            longitude: joi_1.default.string().required(),
            star_category: joi_1.default.number().integer().required(),
            postal_code: joi_1.default.number().allow().optional(),
            address: joi_1.default.string().required(),
            city_code: joi_1.default.number().required(),
            country_code: joi_1.default.string().required(),
            expiry_date: joi_1.default.date().required(),
            user_name: joi_1.default.string().lowercase().trim().regex(/^\S/).required(),
            password: joi_1.default.string().trim().regex(/^\S/).required(),
            permission: joi_1.default.string().lowercase().optional(),
        });
        // update hotel input validator
        this.updateHotelValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            expiry_date: joi_1.default.date().optional(),
        });
        // get all hotel validator
        this.getAllHotelValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            group: joi_1.default.string().optional(),
            city: joi_1.default.string().optional(),
            status: joi_1.default.string()
                .valid("active", "inactive", "blocked", "expired")
                .optional(),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
        });
    }
}
exports.default = MHotelValidator;
//# sourceMappingURL=mHotel.validator.js.map