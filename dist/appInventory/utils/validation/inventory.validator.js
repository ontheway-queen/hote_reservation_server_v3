"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class InventoryValidator {
    constructor() {
        this.getInventoryDetailsValidator = joi_1.default.object({
            key: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = InventoryValidator;
//# sourceMappingURL=inventory.validator.js.map