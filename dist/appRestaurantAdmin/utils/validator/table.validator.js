"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantTableValidator {
    constructor() {
        this.createTableValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            capacity: joi_1.default.number().required(),
            floor_id: joi_1.default.number().required(),
        });
        this.getTablesValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            name: joi_1.default.string().optional(),
            status: joi_1.default.string().valid("available", "booked", "maintenance").optional(),
        });
        this.updateTableValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            capacity: joi_1.default.number().optional(),
            category: joi_1.default.string().valid("in-dine", "takeout", "delivery").optional(),
        });
    }
}
exports.default = RestaurantTableValidator;
//# sourceMappingURL=table.validator.js.map