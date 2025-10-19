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
            order_type: joi_1.default.string().allow("", "walk-in", "reservation").optional(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            restaurant_id: joi_1.default.string().required(),
        });
        this.getUsersSaleReportValidator = joi_1.default.object({
            restaurant_id: joi_1.default.number().required(),
            user_id: joi_1.default.number().optional(),
            from_date: joi_1.default.string().optional(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
        });
        this.getDailyReportValidator = joi_1.default.object({
            restaurant_id: joi_1.default.number().required(),
            order_type: joi_1.default.string().allow("", "walk-in", "reservation").optional(),
            from_date: joi_1.default.string().required(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            to_date: joi_1.default.string().required(),
        });
        this.getProductsReportValidator = joi_1.default.object({
            restaurant_id: joi_1.default.number().required(),
            from_date: joi_1.default.string().required().label("From Date"),
            to_date: joi_1.default.string()
                .required()
                .label("To Date")
                .custom((value, helpers) => {
                const { from_date } = helpers.state.ancestors[0];
                if (!from_date)
                    return value;
                const fromDateObj = new Date(from_date);
                const toDateObj = new Date(value);
                if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
                    return helpers.error("any.invalid", {
                        message: "Invalid date format",
                    });
                }
                if (toDateObj <= fromDateObj) {
                    return helpers.error("any.invalid", {
                        message: "To Date must be greater than From Date",
                    });
                }
                return value;
            }),
            name: joi_1.default.string().optional(),
            category: joi_1.default.string().optional(),
        });
    }
}
exports.default = HotelRestaurantReportValidator;
//# sourceMappingURL=hotelRestaurant.report.validator.js.map