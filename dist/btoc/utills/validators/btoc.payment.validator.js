"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtocPaymentValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class BtocPaymentValidator {
    constructor() {
        // Helper: Parse and validate JSON strings
        this.parseJson = (schema) => {
            return joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const { error } = schema.validate(parsed, { abortEarly: false });
                    if (error) {
                        return helpers.error("any.invalid", { message: error.message });
                    }
                    return parsed;
                }
                catch (_a) {
                    return helpers.error("any.invalid", { message: "Invalid JSON format" });
                }
            }, "Custom JSON parsing");
        };
        this.createSurjopayPaymentOrder = joi_1.default.object({
            checkin: joi_1.default.string().required(),
            checkout: joi_1.default.string().required(),
            room_type_id: joi_1.default.number().required(),
            rate_plan_id: joi_1.default.number().required(),
            rooms: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.object({
                adults: joi_1.default.number().required(),
                children_ages: joi_1.default.array().items(joi_1.default.number()).required(),
                paxes: joi_1.default.array().items(joi_1.default.object({
                    type: joi_1.default.string().valid("AD", "CH").required(),
                    title: joi_1.default.string()
                        .valid("Mr.", "Ms.", "Mrs.", "Mstr.")
                        .required(),
                    name: joi_1.default.string().required(),
                    surname: joi_1.default.string().required(),
                })),
            })), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                catch (err) {
                    return helpers.error("any.invalid");
                }
            }))
                .required(),
            special_requests: joi_1.default.string().allow(""),
            holder: joi_1.default.alternatives()
                .try(joi_1.default.object({
                title: joi_1.default.string().valid("Mr.", "Ms.", "Mrs.", "Mstr.").required(),
                first_name: joi_1.default.string().required(),
                last_name: joi_1.default.string().required(),
                email: joi_1.default.string().email().required(),
                phone: joi_1.default.string().required(),
                address: joi_1.default.string().required(),
                client_nationlity: joi_1.default.string().allow("").optional(),
            }), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                catch (err) {
                    return helpers.error("any.invalid");
                }
            }))
                .required(),
        });
        this.paymentQueryValidator = joi_1.default.object({
            gateway_name: joi_1.default.string().valid("surjopay", "brac").required(),
            is_app: joi_1.default.string().optional(),
            payment_for: joi_1.default.string()
                .valid("hotel", "flight", "tour", "visa")
                .required(),
        });
    }
}
exports.BtocPaymentValidator = BtocPaymentValidator;
//# sourceMappingURL=btoc.payment.validator.js.map