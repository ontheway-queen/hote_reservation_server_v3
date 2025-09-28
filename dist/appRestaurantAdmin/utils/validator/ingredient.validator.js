"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantIngredientValidator {
    constructor() {
        this.createIngredientValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            measurement_id: joi_1.default.number().required(),
        });
        this.getIngredientsValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
        });
        this.updateIngredientValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            measurement_id: joi_1.default.number().optional(),
        });
    }
}
exports.default = RestaurantIngredientValidator;
//# sourceMappingURL=ingredient.validator.js.map