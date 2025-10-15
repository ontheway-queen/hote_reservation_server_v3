"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class RestaurantOrderValidator {
    constructor() {
        this.createOrderValidator = joi_1.default.object({
            staff_id: joi_1.default.number().integer().optional(),
            customer_name: joi_1.default.string().optional(),
            customer_phone: joi_1.default.string().allow("").optional(),
            order_type: joi_1.default.string()
                .valid("walk-in", "reservation", "takeout", "delivery")
                .required(),
            booking_id: joi_1.default.number().optional(),
            table_id: joi_1.default.number().integer().required(),
            discount: joi_1.default.number().precision(2).optional().default(0),
            discount_type: joi_1.default.string()
                .valid("percentage", "fixed")
                .optional()
                .default(null),
            service_charge: joi_1.default.number().precision(2).required(),
            service_charge_type: joi_1.default.string().valid("percentage", "fixed").required(),
            vat_type: joi_1.default.string().valid("percentage", "fixed").required(),
            vat: joi_1.default.number().precision(2).required(),
            room_no: joi_1.default.number().optional().default(null),
            order_items: joi_1.default.array()
                .items(joi_1.default.object({
                food_id: joi_1.default.number().integer().required(),
                quantity: joi_1.default.number().integer().min(1).required(),
            }))
                .min(1)
                .required(),
        });
        this.completeOrderPaymentValidator = joi_1.default.object({
            payable_amount: joi_1.default.number().precision(2).required(),
            acc_id: joi_1.default.number().optional(),
            booking_id: joi_1.default.number().optional(),
            room_id: joi_1.default.number().optional(),
            pay_with: joi_1.default.string().valid("reservation", "instant").required(),
        });
        this.updateOrderValidator = joi_1.default.object({
            staff_id: joi_1.default.number().integer().optional(),
            order_type: joi_1.default.string()
                .valid("walk-in", "reservation", "takeout", "delivery")
                .required(),
            guest: joi_1.default.string().optional(),
            booking_id: joi_1.default.number().optional(),
            customer_name: joi_1.default.string().optional(),
            customer_phone: joi_1.default.string().optional(),
            table_id: joi_1.default.number().integer().required(),
            discount: joi_1.default.number().precision(2).optional().default(0),
            discount_type: joi_1.default.string()
                .valid("percentage", "fixed")
                .optional()
                .default(null),
            service_charge: joi_1.default.number().precision(2).required(),
            service_charge_type: joi_1.default.string().valid("percentage", "fixed").required(),
            vat_type: joi_1.default.string().valid("percentage", "fixed").required(),
            vat: joi_1.default.number().precision(2).required(),
            room_no: joi_1.default.number().optional(),
            order_items: joi_1.default.array()
                .items(joi_1.default.object({
                food_id: joi_1.default.number().integer().required(),
                quantity: joi_1.default.number().integer().min(1).required(),
            }))
                .min(1)
                .required(),
        });
    }
}
exports.default = RestaurantOrderValidator;
//# sourceMappingURL=order.validator.js.map