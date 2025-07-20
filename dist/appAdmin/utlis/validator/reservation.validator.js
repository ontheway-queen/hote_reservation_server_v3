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
        // public createBookingValidator = Joi.object({
        //   reservation_type: Joi.string().valid("hold", "booked").required(),
        //   is_checked_in: Joi.bool().required(),
        //   is_individual_booking: Joi.bool().required(),
        //   check_in: Joi.date().iso().required(),
        //   check_out: Joi.date().iso().required(),
        //   guest: Joi.object({
        //     first_name: Joi.string().required(),
        //     last_name: Joi.string().required(),
        //     email: Joi.string().email().allow("").optional(),
        //     address: Joi.string().allow("").optional(),
        //     phone: Joi.string().required(),
        //     nationality: Joi.string().required(),
        //     country: Joi.string().required(),
        //   }).required(),
        //   pickup: Joi.boolean().required(),
        //   pickup_from: Joi.when("pickup", {
        //     is: true,
        //     then: Joi.string().required(),
        //     otherwise: Joi.forbidden(),
        //   }),
        //   pickup_time: Joi.when("pickup", {
        //     is: true,
        //     then: Joi.string().isoDate().required(), // assuming ISO datetime string
        //     otherwise: Joi.forbidden(),
        //   }),
        //   drop: Joi.boolean().required(),
        //   drop_to: Joi.when("drop", {
        //     is: true,
        //     then: Joi.string().required(),
        //     otherwise: Joi.forbidden(),
        //   }),
        //   drop_time: Joi.when("drop", {
        //     is: true,
        //     then: Joi.string().isoDate().required(),
        //     otherwise: Joi.forbidden(),
        //   }),
        //   // discount_amount: Joi.number().min(0).required(),
        //   service_charge: Joi.number().min(0).required(),
        //   vat: Joi.number().min(0).required(),
        //   rooms: Joi.array()
        //     .items(
        //       Joi.object({
        //         room_type_id: Joi.number().required(),
        //         rate_plan_id: Joi.number().required(),
        //         rate: Joi.object({
        //           base_price: Joi.number().required(),
        //           changed_price: Joi.number().required(),
        //         }).required(),
        //         number_of_rooms: Joi.number().min(1).required(),
        //         guests: Joi.array()
        //           .items(
        //             Joi.object({
        //               room_id: Joi.number().required(),
        //               adults: Joi.number().min(1).required(),
        //               children: Joi.number().min(0).required(),
        //               infant: Joi.number().min(0).required(),
        //               cbf: Joi.number().min(0).required(),
        //             })
        //           )
        //           .min(1)
        //           .required(),
        //         meal_plans_ids: Joi.array().items(Joi.number()).optional(),
        //       })
        //     )
        //     .min(1)
        //     .required(),
        //   company_name: Joi.string().allow("").optional(),
        //   visit_purpose: Joi.string().allow("").optional(),
        //   is_company_booked: Joi.boolean().optional().default(false),
        //   special_requests: Joi.string().allow("").optional(),
        //   is_payment_given: Joi.bool().required(),
        //   payment: Joi.object({
        //     method: Joi.string().valid("MOBILE_BANKING", "BANK", "CASH").required(),
        //     acc_id: Joi.number().required(),
        //     amount: Joi.number().required(),
        //   }).optional(),
        //   source_id: Joi.number().required(),
        // });
        this.createBookingValidator = joi_1.default.object({
            is_individual_booking: joi_1.default.bool().required(),
            reservation_type: joi_1.default.string().valid("hold", "booked").required(),
            is_checked_in: joi_1.default.bool().required(),
            check_in: joi_1.default.date().iso().required(),
            check_out: joi_1.default.date().iso().required(),
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
            service_charge: joi_1.default.number().min(0).required(),
            vat: joi_1.default.number().min(0).required(),
            service_charge_percentage: joi_1.default.number().min(0).default(0),
            vat_percentage: joi_1.default.number().min(0).default(0),
            lead_guest_info: joi_1.default.object({
                first_name: joi_1.default.string().optional(),
                last_name: joi_1.default.string().allow("").optional(),
                email: joi_1.default.string().allow("").optional(),
                phone: joi_1.default.string().allow("").optional(),
                country_id: joi_1.default.number().required(),
                address: joi_1.default.string().allow("").optional(),
                passport_no: joi_1.default.string().allow("").optional(),
                type: joi_1.default.string().allow("adult", "child", "infant").required(),
            }),
            booked_room_types: joi_1.default.array()
                .items(joi_1.default.object({
                room_type_id: joi_1.default.number().required(),
                rate_plan_id: joi_1.default.number().required(),
                rooms: joi_1.default.array()
                    .items(joi_1.default.object({
                    check_in: joi_1.default.date().iso().required(),
                    check_out: joi_1.default.date().iso().required(),
                    room_id: joi_1.default.number().required(),
                    cbf: joi_1.default.number().required().default(0),
                    adults: joi_1.default.number().min(1).required(),
                    children: joi_1.default.number().min(0).required(),
                    infant: joi_1.default.number().min(0).required(),
                    rate: joi_1.default.object({
                        base_rate: joi_1.default.number().required(),
                        changed_rate: joi_1.default.number().required(),
                    }).required(),
                    guest_info: joi_1.default.array().items(joi_1.default.object({
                        first_name: joi_1.default.string().optional(),
                        last_name: joi_1.default.string().allow("").optional(),
                        email: joi_1.default.string().allow("").optional(),
                        phone: joi_1.default.string().allow("").optional(),
                        country_id: joi_1.default.number().required(),
                        address: joi_1.default.string().allow("").optional(),
                        passport_no: joi_1.default.string().allow("").optional(),
                        type: joi_1.default.string()
                            .allow("adult", "child", "infant")
                            .required(),
                        is_room_primary_guest: joi_1.default.boolean().required(),
                    })),
                }))
                    .min(1)
                    .required(),
                meal_plans_ids: joi_1.default.array().items(joi_1.default.number()).optional(),
            }))
                .min(1)
                .required(),
            company_name: joi_1.default.string().allow("").optional(),
            visit_purpose: joi_1.default.string().allow("").optional(),
            is_company_booked: joi_1.default.boolean().optional().default(false),
            special_requests: joi_1.default.string().allow("").optional(),
            is_payment_given: joi_1.default.bool().required(),
            payment: joi_1.default.object({
                method: joi_1.default.string().valid("MOBILE_BANKING", "BANK", "CASH").required(),
                acc_id: joi_1.default.number().required(),
                amount: joi_1.default.number().required(),
            }).optional(),
            source_id: joi_1.default.number().required(),
        });
        this.createGroupBookingValidator = joi_1.default.object({
            is_individual_booking: joi_1.default.bool().required(),
            reservation_type: joi_1.default.string().valid("hold", "booked").required(),
            is_checked_in: joi_1.default.bool().required(),
            check_in: joi_1.default.date().iso().required(),
            check_out: joi_1.default.date().iso().required(),
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
            service_charge: joi_1.default.number().min(0).required(),
            vat: joi_1.default.number().min(0).required(),
            service_charge_percentage: joi_1.default.number().min(0).default(0),
            vat_percentage: joi_1.default.number().min(0).default(0),
            lead_guest_info: joi_1.default.object({
                first_name: joi_1.default.string().optional(),
                last_name: joi_1.default.string().allow("").optional(),
                email: joi_1.default.string().allow("").optional(),
                phone: joi_1.default.string().allow("").optional(),
                country_id: joi_1.default.number().required(),
                address: joi_1.default.string().allow("").optional(),
                type: joi_1.default.string().allow("adult", "child", "infant").required(),
                passport_no: joi_1.default.string().allow("").optional(),
            }),
            booked_room_types: joi_1.default.array()
                .items(joi_1.default.object({
                room_type_id: joi_1.default.number().required(),
                rate_plan_id: joi_1.default.number().required(),
                rooms: joi_1.default.array()
                    .items(joi_1.default.object({
                    check_in: joi_1.default.date().iso().required(),
                    check_out: joi_1.default.date().iso().required(),
                    room_id: joi_1.default.number().required(),
                    cbf: joi_1.default.number().required().default(0),
                    adults: joi_1.default.number().min(1).required(),
                    children: joi_1.default.number().min(0).required(),
                    infant: joi_1.default.number().min(0).required(),
                    rate: joi_1.default.object({
                        base_rate: joi_1.default.number().required(),
                        changed_rate: joi_1.default.number().required(),
                    }).required(),
                    guest_info: joi_1.default.array().items(joi_1.default.object({
                        first_name: joi_1.default.string().optional(),
                        last_name: joi_1.default.string().allow("").optional(),
                        email: joi_1.default.string().allow("").optional(),
                        phone: joi_1.default.string().allow("").optional(),
                        country_id: joi_1.default.number().required(),
                        address: joi_1.default.string().allow("").optional(),
                        type: joi_1.default.string()
                            .allow("adult", "child", "infant")
                            .required(),
                        passport_no: joi_1.default.string().allow("").optional(),
                        is_room_primary_guest: joi_1.default.boolean().required(),
                    })),
                }))
                    .min(1)
                    .required(),
                meal_plans_ids: joi_1.default.array().items(joi_1.default.number()).optional(),
            }))
                .min(1)
                .required(),
            company_name: joi_1.default.string().allow("").optional(),
            visit_purpose: joi_1.default.string().allow("").optional(),
            is_company_booked: joi_1.default.boolean().optional().default(false),
            special_requests: joi_1.default.string().allow("").optional(),
            is_payment_given: joi_1.default.bool().required(),
            payment: joi_1.default.object({
                method: joi_1.default.string().valid("MOBILE_BANKING", "BANK", "CASH").required(),
                acc_id: joi_1.default.number().required(),
                amount: joi_1.default.number().required(),
            }).optional(),
            source_id: joi_1.default.number().required(),
        });
        this.getAllBookingByBookingModeValidator = joi_1.default.object({
            current_date: joi_1.default.string().required(),
            booking_mode: joi_1.default.string().valid("arrival", "departure", "stay").required(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            search: joi_1.default.string().allow("").optional(),
        });
        this.updateSingleBookingValidator = joi_1.default.object({
            changed_rate_of_booking_rooms: joi_1.default.array()
                .items(joi_1.default.object({
                room_id: joi_1.default.number().required(),
                unit_base_rate: joi_1.default.number().required(),
                unit_changed_rate: joi_1.default.number().required(),
            }))
                .optional(),
            add_room_types: joi_1.default.array()
                .items(joi_1.default.object({
                room_type_id: joi_1.default.number().required(),
                rate_plan_id: joi_1.default.number().required(),
                rooms: joi_1.default.array()
                    .items(joi_1.default.object({
                    check_in: joi_1.default.date().iso().required(),
                    check_out: joi_1.default.date().iso().required(),
                    room_id: joi_1.default.number().required(),
                    cbf: joi_1.default.number().required().default(0),
                    adults: joi_1.default.number().min(1).required(),
                    children: joi_1.default.number().min(0).required(),
                    infant: joi_1.default.number().min(0).required(),
                    rate: joi_1.default.object({
                        base_rate: joi_1.default.number().required(),
                        changed_rate: joi_1.default.number().required(),
                    }).required(),
                    guest_info: joi_1.default.array().items(joi_1.default.object({
                        first_name: joi_1.default.string().optional(),
                        last_name: joi_1.default.string().allow("").optional(),
                        email: joi_1.default.string().allow("").optional(),
                        phone: joi_1.default.string().allow("").optional(),
                        country_id: joi_1.default.number().required(),
                        address: joi_1.default.string().allow("").optional(),
                        passport_no: joi_1.default.string().allow("").optional(),
                        type: joi_1.default.string()
                            .allow("adult", "child", "infant")
                            .required(),
                        is_lead_guest: joi_1.default.boolean().required(),
                    })),
                }))
                    .min(1)
                    .required(),
                meal_plans_ids: joi_1.default.array().items(joi_1.default.number()).optional(),
            }))
                .min(1)
                .optional(),
            removed_rooms: joi_1.default.array().items(joi_1.default.number().required()).optional(),
        });
        this.addPayment = joi_1.default.object({
            folio_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            acc_id: joi_1.default.number().required(),
            payment_date: joi_1.default.string().required(),
            remarks: joi_1.default.string().allow("").optional(),
        });
        this.adjustBalance = joi_1.default.object({
            folio_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            remarks: joi_1.default.string().allow("").optional(),
        });
        this.addItemByFolioID = joi_1.default.object({
            folio_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            remarks: joi_1.default.string().allow("").optional(),
        });
        this.refundPayment = joi_1.default.object({
            folio_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            acc_id: joi_1.default.number().required(),
            payment_date: joi_1.default.string().required(),
            remarks: joi_1.default.string().allow("").optional(),
        });
        this.changeDatesOfBooking = joi_1.default.object({
            check_in: joi_1.default.string().required(),
            check_out: joi_1.default.string().required(),
        });
        this.changeRoomOfAReservation = joi_1.default.object({
            previous_room_id: joi_1.default.number().required(),
            new_room_id: joi_1.default.number().required(),
        });
        this.updateOthersOfARoomByBookingID = joi_1.default.object({
            adults: joi_1.default.number().optional(),
            children: joi_1.default.number().optional(),
            cbf: joi_1.default.number().optional(),
        });
        this.changeDatesOfBookingRoom = joi_1.default.object({
            check_in: joi_1.default.string().required(),
            check_out: joi_1.default.string().required(),
            room_id: joi_1.default.number().required(),
        });
        this.updateReservationHoldStatusValidator = joi_1.default.object({
            status: joi_1.default.string().allow("confirmed", "canceled").required(),
        });
    }
}
exports.ReservationValidator = ReservationValidator;
//# sourceMappingURL=reservation.validator.js.map