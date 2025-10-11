"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantReportValidator {
    constructor() {
        this.getDailyReportValidator = joi_1.default.object({
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
                if (isNaN(fromDateObj.getTime()) ||
                    isNaN(toDateObj.getTime())) {
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
        });
        this.getProductsReportValidator = joi_1.default.object({
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
                if (isNaN(fromDateObj.getTime()) ||
                    isNaN(toDateObj.getTime())) {
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
exports.default = RestaurantReportValidator;
//# sourceMappingURL=report.validator.js.map