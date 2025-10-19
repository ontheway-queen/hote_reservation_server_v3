"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HotelRestaurantValidator {
    constructor() {
        this.createRestaurantValidator = joi_1.default.object({
            user: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const userType = typeof parsed;
                    if (userType !== "object") {
                        return helpers.message({
                            custom: "Invalid user, should be a JSON object",
                        });
                    }
                    console.log({ user: parsed });
                    return parsed;
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid user, should be a valid JSON Object",
                    });
                }
            }),
            restaurant: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const restaurentType = typeof parsed;
                    if (restaurentType !== "object") {
                        return helpers.message({
                            custom: "Invalid restaurent, should be a JSON object",
                        });
                    }
                    console.log({ restaurant: parsed });
                    return parsed;
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid restaurent, should be a valid JSON Object",
                    });
                }
            }),
            staffs: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const restaurentType = typeof parsed;
                    if (!Array.isArray(parsed)) {
                        return helpers.message({
                            custom: "Invalid staffs. Expected an array of numbers",
                        });
                    }
                    return parsed;
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid staffs.",
                    });
                }
            }),
        });
        this.updateHotelRestaurantValidator = joi_1.default.object({
            user: joi_1.default.string()
                .custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const userType = typeof parsed;
                    if (userType !== "object") {
                        return helpers.message({
                            custom: "Invalid user, should be a JSON object",
                        });
                    }
                    return parsed;
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid user, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
            restaurant: joi_1.default.string()
                .custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const restaurentType = typeof parsed;
                    if (restaurentType !== "object") {
                        return helpers.message({
                            custom: "Invalid restaurent, should be a JSON object",
                        });
                    }
                    return parsed;
                }
                catch (err) {
                    return helpers.message({
                        custom: "Invalid restaurent, should be a valid JSON Object",
                    });
                }
            })
                .optional(),
        });
        this.getAllRestaurantQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            key: joi_1.default.string().allow("").optional(),
        });
        this.removeStaffValidator = joi_1.default.object({
            staff_id: joi_1.default.number().integer().required(),
            restaurant_id: joi_1.default.number().integer().required(),
        });
    }
}
exports.default = HotelRestaurantValidator;
//# sourceMappingURL=restaurant.hotel.validator.js.map