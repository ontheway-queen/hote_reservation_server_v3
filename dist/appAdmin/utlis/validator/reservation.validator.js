"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class ReservationValidator {
    constructor() {
        this.getAvailableRoomsValidator = joi_1.default.object({
            booking_type: joi_1.default.string().allow("single", "group").required(),
            check_in: joi_1.default.date().required(),
            check_out: joi_1.default.date().required(),
            rooms: joi_1.default.array().items(joi_1.default.object({
                adults: joi_1.default.number().required(),
                children: joi_1.default.number().required(),
                children_ages: joi_1.default.array().items(joi_1.default.number().required()).optional(),
            })),
        });
        this.createBookingValidator = joi_1.default.object({
            hotel_code: joi_1.default.string().required(),
            check_in: joi_1.default.date().iso().required(),
            check_out: joi_1.default.date().iso().required(),
            booking_source: joi_1.default.string().required(),
            special_requests: joi_1.default.string().allow("").optional(),
            guest: joi_1.default.object({
                first_name: joi_1.default.string().required(),
                last_name: joi_1.default.string().required(),
                email: joi_1.default.string().email().required(),
                phone: joi_1.default.string().required(),
                nationality: joi_1.default.string().required(),
            }).required(),
            rooms: joi_1.default.array()
                .items(joi_1.default.object({
                room_type_id: joi_1.default.number().required(),
                rate_plan_id: joi_1.default.number().required(),
                number_of_rooms: joi_1.default.number().min(1).required(),
                guests: joi_1.default.array()
                    .items(joi_1.default.object({
                    adults: joi_1.default.number().min(1).required(),
                    children: joi_1.default.number().min(0).required(),
                }))
                    .min(1)
                    .required(),
                cancellation_policy: joi_1.default.object({
                    cancellation_policy_id: joi_1.default.number().required(),
                    cancellation_policy_name: joi_1.default.string().required(),
                    cancellation_policy_details: joi_1.default.array()
                        .items(joi_1.default.object({
                        fee_type: joi_1.default.string()
                            .valid("fixed", "percentage")
                            .required(),
                        fee_value: joi_1.default.number().required(),
                        rule_type: joi_1.default.string()
                            .valid("free", "charge", "no_show")
                            .required(),
                        days_before: joi_1.default.number().min(0).required(),
                        cancellation_policy_id: joi_1.default.number().required(),
                    }))
                        .min(1)
                        .required(),
                }).required(),
                meal_plans: joi_1.default.array()
                    .items(joi_1.default.object({
                    meal_plan_item_id: joi_1.default.number().required(),
                    meal_plan_name: joi_1.default.string().required(),
                    included: joi_1.default.boolean().required(),
                    price: joi_1.default.number().required(),
                    vat: joi_1.default.number().min(0).required(),
                }))
                    .optional(),
                rate_breakdown: joi_1.default.array()
                    .items(joi_1.default.object({
                    base_rate: joi_1.default.number().required(),
                    extra_adult_charge: joi_1.default.number().required(),
                    extra_child_charge: joi_1.default.number().required(),
                    total_rate: joi_1.default.number().required(),
                }))
                    .min(1)
                    .required(),
                total_price: joi_1.default.number().required(),
            }))
                .min(1)
                .required(),
        });
    }
}
exports.ReservationValidator = ReservationValidator;
//# sourceMappingURL=reservation.validator.js.map