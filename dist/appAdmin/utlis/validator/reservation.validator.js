"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class ReservationValidator {
    constructor() {
        this.getAvailableRoomsQueryValidator = joi_1.default.object({
            check_in: joi_1.default.date().required(),
            check_out: joi_1.default.date().required(),
        });
        this.createBookingValidator = joi_1.default.object({
            reservation_type: joi_1.default.string().valid("hold", "confirm").required(),
            is_checked_in: joi_1.default.bool().required(),
            check_in: joi_1.default.date().iso().required(),
            check_out: joi_1.default.date().iso().required(),
            guest: joi_1.default.object({
                first_name: joi_1.default.string().required(),
                last_name: joi_1.default.string().required(),
                email: joi_1.default.string().email().required(),
                address: joi_1.default.string().allow("").optional(),
                phone: joi_1.default.string().required(),
                nationality: joi_1.default.string().required(),
            }).required(),
            pickup: joi_1.default.boolean().required(),
            pickup_from: joi_1.default.when("pickup", {
                is: true,
                then: joi_1.default.string().required(),
                otherwise: joi_1.default.forbidden(),
            }),
            pickup_time: joi_1.default.when("pickup", {
                is: true,
                then: joi_1.default.string().isoDate().required(),
                otherwise: joi_1.default.forbidden(),
            }),
            drop: joi_1.default.boolean().required(),
            drop_to: joi_1.default.when("drop", {
                is: true,
                then: joi_1.default.string().required(),
                otherwise: joi_1.default.forbidden(),
            }),
            drop_time: joi_1.default.when("drop", {
                is: true,
                then: joi_1.default.string().isoDate().required(),
                otherwise: joi_1.default.forbidden(),
            }),
            discount_amount: joi_1.default.number().min(0).required(),
            service_charge: joi_1.default.number().min(0).required(),
            vat: joi_1.default.number().min(0).required(),
            rooms: joi_1.default.array()
                .items(joi_1.default.object({
                room_type_id: joi_1.default.number().required(),
                rate_plan_id: joi_1.default.number().required(),
                rate: joi_1.default.object({
                    base_price: joi_1.default.number().required(),
                    changed_price: joi_1.default.number().required(),
                }).required(),
                number_of_rooms: joi_1.default.number().min(1).required(),
                guests: joi_1.default.array()
                    .items(joi_1.default.object({
                    room_id: joi_1.default.number().required(),
                    adults: joi_1.default.number().min(1).required(),
                    children: joi_1.default.number().min(0).required(),
                    infant: joi_1.default.number().min(0).required(),
                }))
                    .min(1)
                    .required(),
                meal_plans_ids: joi_1.default.array().items(joi_1.default.number()).optional(),
            }))
                .min(1)
                .required(),
            special_requests: joi_1.default.string().allow("").optional(),
            payment: joi_1.default.object({
                method: joi_1.default.string().valid("cash", "card", "online").required(),
                acc_id: joi_1.default.number().required(),
                amount: joi_1.default.number().required(),
            }).required(),
            source_id: joi_1.default.number().required(),
        });
    }
}
exports.ReservationValidator = ReservationValidator;
//# sourceMappingURL=reservation.validator.js.map