"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class DashBoardValidator {
    constructor() {
        this.getAllAmountQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
        });
        this.getAllAccountQueryValidator = joi_1.default.object({
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
            ac_type: joi_1.default.string().allow("").required(),
        });
        this.getGuestReport = joi_1.default.object({
            current_date: joi_1.default.string().required(),
            booking_mode: joi_1.default.string().valid("arrival", "departure", "stay").required(),
        });
        this.getAllRoomsQueryValidator = joi_1.default.object({
            current_date: joi_1.default.string().required(),
        });
    }
}
exports.default = DashBoardValidator;
//# sourceMappingURL=dashboard.validator.js.map