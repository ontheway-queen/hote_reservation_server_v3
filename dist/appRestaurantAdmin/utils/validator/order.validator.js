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
            order_type: joi_1.default.string()
                .valid("in-dine", "takeout", "delivery")
                .required(),
            customer: joi_1.default.string()
                .pattern(/^(?:\+8801|01)[3-9]\d{8}$/)
                .required()
                .messages({
                "string.pattern.base": "Customer must be a valid Bangladeshi phone number",
            }),
            table_id: joi_1.default.number().integer().required(),
            total: joi_1.default.number().precision(2).required(),
            service_charge: joi_1.default.number().precision(2).required(),
            service_charge_type: joi_1.default.string()
                .valid("percentage", "fixed")
                .required(),
            discount: joi_1.default.number().precision(2).optional().default(null),
            discount_type: joi_1.default.string()
                .valid("percentage", "fixed")
                .optional()
                .default(null),
            vat_rate: joi_1.default.number().precision(2).required(),
            sub_total: joi_1.default.number().precision(2).required(),
            grand_total: joi_1.default.number().precision(2).required(),
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
        });
        this.updateKitchenOrdersValidator = joi_1.default.object({
            id: joi_1.default.number().integer().required(),
            kitchen_status: joi_1.default.string()
                .valid("preparing", "completed", "canceled")
                .required(),
        });
        this.updateOrderValidator = joi_1.default.object({
            staff_id: joi_1.default.number().integer().optional(),
            order_type: joi_1.default.string()
                .valid("in-dine", "takeout", "delivery")
                .required(),
            customer: joi_1.default.string()
                .pattern(/^(?:\+8801|01)[3-9]\d{8}$/)
                .required()
                .messages({
                "string.pattern.base": "Customer must be a valid Bangladeshi phone number",
            }),
            total: joi_1.default.number().precision(2).required(),
            service_charge: joi_1.default.number().precision(2).required(),
            service_charge_type: joi_1.default.string()
                .valid("percentage", "fixed")
                .required(),
            discount: joi_1.default.number().precision(2).optional().default(null),
            discount_type: joi_1.default.string()
                .valid("percentage", "fixed")
                .optional()
                .default(null),
            vat_rate: joi_1.default.number().precision(2).required(),
            sub_total: joi_1.default.number().precision(2).required(),
            grand_total: joi_1.default.number().precision(2).required(),
            room_no: joi_1.default.number().optional().default(null),
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