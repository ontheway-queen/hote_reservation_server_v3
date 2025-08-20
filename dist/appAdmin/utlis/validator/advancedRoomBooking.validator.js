"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdvancedRoomBookingValidator {
    constructor() {
        // create advanced room booking validator
        this.createAdvancedRoomBookingValidator = joi_1.default.object({
            name: joi_1.default.string().required(),
            email: joi_1.default.string().allow("").optional(),
            phone: joi_1.default.string().allow("").optional(),
            check_in_time: joi_1.default.string().required(),
            check_out_time: joi_1.default.string().required(),
            nationality: joi_1.default.string().allow("").optional(),
            group_name: joi_1.default.string().allow("").optional(),
            total_room: joi_1.default.number().required(),
            extra_charge: joi_1.default.number().optional(),
        });
        // confirm room booking validator
        this.confirmRoomBookingValidator = joi_1.default.object({
            discount_amount: joi_1.default.number().required(),
            tax_amount: joi_1.default.number().required(),
            payment_type: joi_1.default.string().allow("").optional(),
            check_in_time: joi_1.default.string().allow("").optional(),
            ac_tr_ac_id: joi_1.default.number().optional(),
            total_room: joi_1.default.number().optional(),
            extra_charge: joi_1.default.number().required(),
            paid_amount: joi_1.default.number().optional(),
            check_in: joi_1.default.number().valid(1, 0).required(),
            booking_rooms: joi_1.default.array()
                .items(joi_1.default.object({
                room_id: joi_1.default.number().required(),
                amount: joi_1.default.number().required(),
                name: joi_1.default.string().required(),
            }))
                .required(),
        });
        // refund room booking
        this.refundRoomBookingValidator = joi_1.default.object({
            charge: joi_1.default.number().required(),
            refund_from_acc: joi_1.default.number().required(),
            refund_type: joi_1.default.string().required(),
        });
        // get all room booking query validator
        this.getAllRoomBookingQueryValidator = joi_1.default.object({
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
            name: joi_1.default.string().allow("").optional(),
            status: joi_1.default.string().allow("").optional(),
            user_id: joi_1.default.string().allow("").optional(),
        });
        // insert booking check in
        this.insertBookingCheckIn = joi_1.default.object({
            booking_id: joi_1.default.number().required(),
            check_in: joi_1.default.string().required(),
        });
        // add booking check out
        this.addBookingCheckOut = joi_1.default.object({
            check_out: joi_1.default.string().required(),
        });
        // extend Room Booking Validator
        this.extendRoomBookingValidator = joi_1.default.object({
            check_out_time: joi_1.default.string().required(),
            sub_total: joi_1.default.number().optional(),
            due: joi_1.default.number().optional(),
            grand_total: joi_1.default.number().optional(),
            extend_status: joi_1.default.number().optional(),
            extend_nights: joi_1.default.number().optional(),
            booking_rooms: joi_1.default.array()
                .items(joi_1.default.object({
                room_id: joi_1.default.number().required(),
            }))
                .required(),
        });
    }
}
exports.default = AdvancedRoomBookingValidator;
//# sourceMappingURL=advancedRoomBooking.validator.js.map