"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantUnitsValidator {
    constructor() {
        this.createUnitValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            short_code: joi_1.default.string().required(),
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
exports.default = RestaurantUnitsValidator;
//# sourceMappingURL=unit.validator.js.map