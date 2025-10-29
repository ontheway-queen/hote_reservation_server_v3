"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantConfigurationValidator {
    constructor() {
        this.updatePrepareFoodOption = joi_1.default.object({
            is_prepare_food_enabled: joi_1.default.bool().required(),
        });
        this.getUnitValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
            short_code: joi_1.default.string().optional(),
        });
        this.updateUnitValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            short_code: joi_1.default.string().optional(),
        });
    }
}
exports.default = RestaurantConfigurationValidator;
//# sourceMappingURL=configuration.validator.js.map