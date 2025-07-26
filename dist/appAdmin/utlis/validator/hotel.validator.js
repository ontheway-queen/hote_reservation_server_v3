"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HotelValidator {
    constructor() {
        this.updateHotelValidator = joi_1.default.object({
            name: joi_1.default.string().allow("").optional(),
            bin: joi_1.default.string().allow("").optional(),
            description: joi_1.default.string().allow("").optional(),
            postal_code: joi_1.default.string()
                .lowercase()
                .trim()
                .allow("")
                .regex(/^\S/)
                .optional(),
            zip_code: joi_1.default.string().trim().allow("").optional(),
            fax: joi_1.default.string().trim().allow("").optional(),
            website_url: joi_1.default.string().trim().allow("").optional(),
            phone: joi_1.default.string().trim().allow("").optional(),
            optional_phone1: joi_1.default.string().trim().allow("").optional(),
            // hotel_amnities: Joi.string()
            //   .custom((value, helpers) => {
            //     try {
            //       const parsedArray = JSON.parse(value);
            //       if (!Array.isArray(parsedArray)) {
            //         return helpers.message({
            //           custom:
            //             "invalid hotel_amnities, hotel_amnities will be json array of string",
            //         });
            //       }
            //       for (const item of parsedArray) {
            //         if (typeof item !== "string") {
            //           return helpers.message({
            //             custom:
            //               "invalid hotel_amnities array item type, item type will be string",
            //           });
            //         }
            //       }
            //       return value;
            //     } catch (err) {
            //       return helpers.message({
            //         custom:
            //           "invalid hotel_amnities, hotel_amnities will be json array of string",
            //       });
            //     }
            //   })
            //   .optional(),
            // remove_amnities: Joi.string()
            //   .custom((value, helpers) => {
            //     try {
            //       const parsedArray = JSON.parse(value);
            //       if (!Array.isArray(parsedArray)) {
            //         return helpers.message({
            //           custom:
            //             "invalid remove_amnities, remove_amnities will be json array of number",
            //         });
            //       }
            //       for (const item of parsedArray) {
            //         if (typeof item !== "number") {
            //           return helpers.message({
            //             custom:
            //               "invalid remove_amnities array item type, item type will be number",
            //           });
            //         }
            //       }
            //       return value;
            //     } catch (err) {
            //       return helpers.message({
            //         custom:
            //           "invalid remove_amnities, remove_amnities will be json array of number",
            //       });
            //     }
            //   })
            //   .optional(),
            remove_hotel_images: joi_1.default.string()
                .custom((value, helpers) => {
                try {
                    const parsedArray = JSON.parse(value);
                    if (!Array.isArray(parsedArray)) {
                        return helpers.message({
                            custom: "invalid remove_photo, remove_photo will be json array of number",
                        });
                    }
                    for (const item of parsedArray) {
                        if (typeof item !== "number") {
                            return helpers.message({
                                custom: "invalid remove_photo array item type, item type will be number",
                            });
                        }
                    }
                    return value;
                }
                catch (err) {
                    return helpers.message({
                        custom: "invalid remove_photo, remove_photo will be json array of number",
                    });
                }
            })
                .optional(),
        });
    }
}
exports.default = HotelValidator;
//# sourceMappingURL=hotel.validator.js.map