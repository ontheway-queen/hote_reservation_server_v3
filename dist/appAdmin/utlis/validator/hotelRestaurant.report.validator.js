"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HotelRestaurantReportValidator {
    constructor() {
        this.getRestaurantSalesReport = joi_1.default.object({
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
            order_type: joi_1.default.string().optional(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            restaurant_id: joi_1.default.string().required(),
        });
    }
}
exports.default = HotelRestaurantReportValidator;
//# sourceMappingURL=hotelRestaurant.report.validator.js.map