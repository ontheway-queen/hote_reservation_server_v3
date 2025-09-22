"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ServiceCategoriesValidator {
    constructor() {
        this.createServiceCategory = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        this.getServiceCategoryQueryValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            key: joi_1.default.string().optional(),
        });
        this.updateServiceCategoryValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
        });
    }
}
exports.default = ServiceCategoriesValidator;
//# sourceMappingURL=serviceCategories.validator.js.map