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
                    return helper.error("food.invalidJSON", {
                        message: "Invalid JSON format",
                    });
                }
                const schema = joi_1.default.object({
                    name: joi_1.default.string().required().messages({
                        "any.required": "Food name is required",
                    }),
                    menu_category_id: joi_1.default.number().required().messages({
                        "any.required": "Menu category ID is required",
                    }),
                    retail_price: joi_1.default.number().required().messages({
                        "any.required": "Retail price is required",
                    }),
                    measurement_per_unit: joi_1.default.number().required().messages({
                        "any.required": "Measurement per unit is required",
                    }),
                    unit_id: joi_1.default.number().required().messages({
                        "any.required": "Unit ID is required",
                    }),
                });
                const { error, value: validated } = schema.validate(parsed);
                if (error)
                    return helper.error("food.invalidData", {
                        message: error.details[0].message,
                    });
                return validated;
            })
                .messages({
                "any.required": "Food data is required",
                "food.invalidJSON": "{{#message}}",
                "food.invalidData": "{{#message}}",
            }),
            ingredients: joi_1.default.string()
                .required()
                .custom((value, helper) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                    console.log({ parsed });
                }
                catch (_a) {
                    console.log(1);
                    return helper.error("ingredients.invalidJSON", {
                        message: "Invalid JSON format",
                    });
                }
                const schema = joi_1.default.array()
                    .items(joi_1.default.object({
                    product_id: joi_1.default.number().required().messages({
                        "any.required": "Product ID is required",
                    }),
                    quantity_per_unit: joi_1.default.number()
                        .positive()
                        .required()
                        .messages({
                        "any.required": "Product quantity is required",
                        "number.positive": "Quantity must be greater than zero",
                    }),
                }))
                    .min(1)
                    .required()
                    .messages({
                    "array.base": "Ingredients must be an array",
                    "array.min": "At least one ingredient is required",
                    "any.required": "Ingredients are required",
                });
                const { error, value: validated } = schema.validate(parsed);
                if (error)
                    return helper.error("ingredients.invalidData", {
                        message: error.details[0].message,
                    });
                return validated;
            })
                .messages({
                "any.required": "Ingredients data is required",
                "ingredients.invalidJSON": "{{#message}}",
                "ingredients.invalidData": "{{#message}}",
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
            ingredients: joi_1.default.string()
                .optional()
                .custom((value, helper) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                    console.log({ parsed });
                }
                catch (_a) {
                    console.log(1);
                    return helper.error("ingredients.invalidJSON", {
                        message: "Invalid JSON format",
                    });
                }
                const schema = joi_1.default.array()
                    .items(joi_1.default.object({
                    product_id: joi_1.default.number().required().messages({
                        "any.required": "Product ID is required",
                    }),
                    quantity_per_unit: joi_1.default.number()
                        .positive()
                        .required()
                        .messages({
                        "any.required": "Product quantity is required",
                        "number.positive": "Quantity must be greater than zero",
                    }),
                }))
                    .min(1)
                    .required()
                    .messages({
                    "array.base": "Ingredients must be an array",
                    "array.min": "At least one ingredient is required",
                    "any.required": "Ingredients are required",
                });
                const { error, value: validated } = schema.validate(parsed);
                if (error)
                    return helper.error("ingredients.invalidData", {
                        message: error.details[0].message,
                    });
                return validated;
            })
                .messages({
                "any.required": "Ingredients data is required",
                "ingredients.invalidJSON": "{{#message}}",
                "ingredients.invalidData": "{{#message}}",
            }),
            remove_ingredients: joi_1.default.string()
                .optional()
                .custom((value, helper) => {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                }
                catch (_a) {
                    return helper.error("any.invalid");
                }
                const schema = joi_1.default.array().items(joi_1.default.number().optional());
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