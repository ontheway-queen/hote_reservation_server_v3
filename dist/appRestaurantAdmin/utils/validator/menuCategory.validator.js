"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantMenuCategoryValidator {
    constructor() {
        this.createMenuCategoryValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        this.getMenuCategoriesValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
            status: joi_1.default.string().valid("available", "unavailable").optional(),
        });
    }
}
exports.default = RestaurantMenuCategoryValidator;
//# sourceMappingURL=menuCategory.validator.js.map