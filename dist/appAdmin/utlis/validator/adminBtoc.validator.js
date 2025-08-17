"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminBtocValidator {
    constructor() {
        this.updateBtocSiteConfig = joi_1.default.object({
            site_config: joi_1.default.object({
                // main_logo: Joi.string().optional(),
                hero_quote: joi_1.default.string().optional(),
                hero_sub_quote: joi_1.default.string().optional(),
                site_name: joi_1.default.string().optional(),
                emails: joi_1.default.array()
                    .items(joi_1.default.object({
                    email: joi_1.default.string().required(),
                }))
                    .optional(),
                numbers: joi_1.default.array()
                    .items(joi_1.default.object({
                    number: joi_1.default.string()
                        .pattern(/^\+?\d+$/)
                        .required(),
                }))
                    .optional(),
                address: joi_1.default.array()
                    .items(joi_1.default.object({
                    title: joi_1.default.string().optional(),
                    address: joi_1.default.string().optional(),
                }))
                    .optional(),
                contact_us_content: joi_1.default.string().optional(),
                // contact_us_thumbnail: Joi.string().optional(),
                about_us_content: joi_1.default.string().optional(),
                // about_us_thumbnail: Joi.string().optional(),
                privacy_policy_content: joi_1.default.string().optional(),
                term_and_conditions_content: joi_1.default.string().optional(),
                meta_title: joi_1.default.string().optional(),
                meta_description: joi_1.default.string().optional(),
                meta_tags: joi_1.default.string().optional(),
                notice: joi_1.default.string().optional(),
                android_app_link: joi_1.default.string().optional(),
                ios_app_link: joi_1.default.string().optional(),
                // fav_icon: Joi.string().optional(),
                // site_thumbnail: Joi.string().optional()
            }).optional(),
            hero_bg_content: joi_1.default.object({
                type: joi_1.default.string().valid("image", "video").optional(),
                content: joi_1.default.string().optional(),
                status: joi_1.default.boolean().optional(),
                order_number: joi_1.default.number().optional(),
                quote: joi_1.default.string().optional(),
                sub_quote: joi_1.default.string().optional(),
                tab: joi_1.default.string().optional(),
            }).optional(),
            pop_up_banner: joi_1.default.object({
                title: joi_1.default.string().optional(),
                // thumbnail: Joi.string().optional(),
                description: joi_1.default.string().optional(),
                status: joi_1.default.boolean().optional(),
                link: joi_1.default.string().optional(),
            }).optional(),
            hot_deals: joi_1.default.object({
                title: joi_1.default.string().optional(),
                // thumbnail: Joi.string().optional(),
                status: joi_1.default.boolean().optional(),
                link: joi_1.default.string().optional(),
                order_number: joi_1.default.string().optional(),
            }).optional(),
            social_links: joi_1.default.object({
                media: joi_1.default.string().optional(),
                link: joi_1.default.string().optional(),
                order_number: joi_1.default.number().optional(),
                // icon: Joi.string()
                status: joi_1.default.boolean().optional(),
            }).optional(),
        });
    }
}
exports.default = AdminBtocValidator;
//# sourceMappingURL=adminBtoc.validator.js.map