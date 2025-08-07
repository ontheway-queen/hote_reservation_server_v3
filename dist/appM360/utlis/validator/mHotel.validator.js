"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class MHotelValidator {
    constructor() {
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
            website_url: joi_1.default.string().allow("").optional(),
            phone: joi_1.default.string().allow("").optional(),
            fax: joi_1.default.string().allow("").optional(),
            latitude: joi_1.default.string().optional(),
            longitude: joi_1.default.string().optional(),
            star_category: joi_1.default.number().integer().default(0),
            postal_code: joi_1.default.number().allow().optional(),
            address: joi_1.default.string().required(),
            city_code: joi_1.default.number().required(),
            country_code: joi_1.default.string().required(),
            expiry_date: joi_1.default.date().required(),
            user_name: joi_1.default.string().lowercase().trim().regex(/^\S/).required(),
            password: joi_1.default.string().trim().regex(/^\S/).required(),
            permission: joi_1.default.string().lowercase().optional(),
        });
        this.updateHotelValidator = joi_1.default.object({
            hotel_name: joi_1.default.string().optional(),
            expiry_date: joi_1.default.date().optional(),
            status: joi_1.default.string().optional(),
            hotel_email: joi_1.default.string()
                .email()
                .lowercase()
                .trim()
                .regex(/^\S/)
                .optional(),
            description: joi_1.default.string().allow("").optional(),
            accommodation_type_id: joi_1.default.number().optional(),
            chain_name: joi_1.default.string().allow("").optional(),
            latitude: joi_1.default.string().allow("").optional(),
            longitude: joi_1.default.string().allow("").optional(),
            star_category: joi_1.default.number().integer().optional(),
            postal_code: joi_1.default.number().allow().optional(),
            address: joi_1.default.string().allow("").optional(),
            city_code: joi_1.default.number().optional(),
            country_code: joi_1.default.string().optional(),
            website_url: joi_1.default.string().allow("").optional(),
            phone: joi_1.default.string().allow("").optional(),
            fax: joi_1.default.string().allow("").optional(),
            remove_hotel_images: joi_1.default.array().items(joi_1.default.number().required()).optional(),
            permission: joi_1.default.string().lowercase().optional(),
        });
        this.getAllHotelValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            group: joi_1.default.string().optional(),
            city: joi_1.default.string().optional(),
            status: joi_1.default.string().optional(),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
        });
        this.insertAccHeadValidator = joi_1.default.object({
            parent_id: joi_1.default.number().required(),
            group_code: joi_1.default.number().required(),
            name: joi_1.default.array().items(joi_1.default.string().required()).required(),
        });
    }
}
exports.default = MHotelValidator;
//# sourceMappingURL=mHotel.validator.js.map