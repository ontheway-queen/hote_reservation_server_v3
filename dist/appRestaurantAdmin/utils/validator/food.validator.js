"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantFoodValidator {
    constructor() {
        this.createFoodValidator = joi_1.default.object({
            food: joi_1.default.string()
                .required()
                .custom((value, helper) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                }
                catch (_a) {
                    return helper.error("any.invalid");
                }
                const schema = joi_1.default.object({
                    name: joi_1.default.string().required(),
                    menu_category_id: joi_1.default.number().required(),
                    retail_price: joi_1.default.number().required(),
                    measurement_per_unit: joi_1.default.number().required(),
                    unit_id: joi_1.default.number().required(),
                });
                const { error, value: validated } = schema.validate(parsed);
                if (error)
                    return helper.error("any.invalid");
                return validated;
            }),
        });
        this.getFoodsValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
            category_id: joi_1.default.number().optional(),
        });
        this.updateFoodValidator = joi_1.default.object({
            food: joi_1.default.string()
                .optional()
                .custom((value, helper) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                }
                catch (_a) {
                    return helper.error("any.invalid");
                }
                const schema = joi_1.default.object({
                    name: joi_1.default.string().optional(),
                    menu_category_id: joi_1.default.number().optional(),
                    retail_price: joi_1.default.number().optional(),
                    measurement_per_unit: joi_1.default.number().optional(),
                    unit_id: joi_1.default.number().optional(),
                    status: joi_1.default.string()
                        .valid("available", "unavailable")
                        .optional(),
                });
                const { error, value: validated } = schema.validate(parsed);
                if (error)
                    return helper.error("any.invalid");
                return validated;
            }),
        });
    }
}
exports.default = RestaurantFoodValidator;
//# sourceMappingURL=food.validator.js.map