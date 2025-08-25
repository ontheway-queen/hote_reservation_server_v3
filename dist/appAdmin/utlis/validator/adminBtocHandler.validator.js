"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AdminBtocHandlerValidator {
    constructor() {
        this.updateBtocSiteConfig = joi_1.default.object({
            hero_quote: joi_1.default.string().optional(),
            hero_sub_quote: joi_1.default.string().optional(),
            site_name: joi_1.default.string().optional(),
            emails: joi_1.default.alternatives()
                .try(joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed))
                        throw new Error("Not an array");
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            }), joi_1.default.array().items(joi_1.default.object({
                email: joi_1.default.string().email().required(),
            })))
                .optional(),
            numbers: joi_1.default.alternatives()
                .try(joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed))
                        throw new Error("Not an array");
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            }), joi_1.default.array().items(joi_1.default.object({
                number: joi_1.default.string()
                    .pattern(/^\+?\d+$/)
                    .required(),
            })))
                .optional(),
            address: joi_1.default.alternatives()
                .try(joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    if (!Array.isArray(parsed))
                        throw new Error("Not an array");
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            }), joi_1.default.array().items(joi_1.default.object({
                title: joi_1.default.string().optional(),
                address: joi_1.default.string().optional(),
            })))
                .optional(),
            contact_us_content: joi_1.default.string().optional(),
            about_us_content: joi_1.default.string().optional(),
            privacy_policy_content: joi_1.default.string().optional(),
            terms_and_conditions_content: joi_1.default.string().optional(),
            meta_title: joi_1.default.string().optional(),
            meta_description: joi_1.default.string().optional(),
            meta_tags: joi_1.default.string().optional(),
            notice: joi_1.default.string().optional(),
            android_app_link: joi_1.default.string().optional(),
            ios_app_link: joi_1.default.string().optional(),
        });
        this.updatePopUpBanner = joi_1.default.object({
            title: joi_1.default.string().optional(),
            // thumbnail: Joi.string().optional(),
            description: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
            link: joi_1.default.string().optional(),
        });
        this.createHeroBGContent = joi_1.default.object({
            type: joi_1.default.string().valid(constants_1.CONTENT_TYPE_PHOTO, constants_1.CONTENT_TYPE_VIDEO).required(),
            quote: joi_1.default.string().optional().trim(),
            sub_quote: joi_1.default.string().optional().trim(),
            tab: joi_1.default.string().valid("HOTEL").optional(),
        });
        this.updateHeroBGContent = joi_1.default.object({
            type: joi_1.default.string().valid(constants_1.CONTENT_TYPE_PHOTO, constants_1.CONTENT_TYPE_VIDEO).optional(),
            quote: joi_1.default.string().optional().trim(),
            sub_quote: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
            order_number: joi_1.default.number().optional(),
            tab: joi_1.default.string().valid("HOTEL").optional(),
        });
        this.updateSocialLinks = joi_1.default.object({
            id: joi_1.default.number().required(),
            media: joi_1.default.string().optional(),
            link: joi_1.default.string().optional(),
            order_number: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            // icon: Joi.string()
        });
        this.updateHotDeals = joi_1.default.object({
            id: joi_1.default.number().required(),
            title: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
            link: joi_1.default.string().optional(),
            order_number: joi_1.default.string().optional(),
            // thumbnail: Joi.string().optional(),
        });
        this.updatePopularRoomTypes = joi_1.default.object({
            id: joi_1.default.number().required(),
            room_type_id: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            order_number: joi_1.default.string().optional(),
            // thumbnail: Joi.string().optional(),
        });
    }
}
exports.default = AdminBtocHandlerValidator;
//# sourceMappingURL=adminBtocHandler.validator.js.map