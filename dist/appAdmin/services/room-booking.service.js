"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class RoomBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create room booking
    createRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { name, email, phone, booking_rooms, check_in_time, check_out_time, discount_amount, tax_amount, total_occupancy, paid_amount, payment_type, ac_tr_ac_id, passport_no, nid_no, check_in, extra_charge, } = req.body;
                // number of nights step
                const checkInTime = new Date(check_in_time);
                const checkOutTime = new Date(check_out_time);
                const timeDifference = checkOutTime - checkInTime;
                const millisecondsInADay = 24 * 60 * 60 * 1000;
                let numberOfNights = Math.floor(timeDifference / millisecondsInADay);
                if (!numberOfNights)
                    numberOfNights = 1;
                const roomBookingModel = this.Model.roomBookingModel(trx);
                // number of nights end
                const guestModel = this.Model.guestModel(trx);
                const checkUser = yield guestModel.getSingleGuest({
                    email,
                    phone,
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room succesfully booked",
                };
            }));
        });
    }
    // get all room booking
    getAllRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name, from_date, to_date, status, user_id } = req.query;
            const model = this.Model.roomBookingModel();
            const { data, total } = yield model.getAllRoomBooking({
                limit: limit,
                skip: skip,
                name: name,
                from_date: from_date,
                to_date: to_date,
                hotel_code,
                status: status,
                user_id: user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get single room booking
    getSingleRoomBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.roomBookingModel().getSingleRoomBooking(parseInt(id), hotel_code);
            if (!data.length) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // insert check in room booking
    insertBookingCheckIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { booking_id, check_in } = req.body;
                const bookingModel = this.Model.roomBookingModel(trx);
                const checkBooking = yield bookingModel.getSingleRoomBooking(booking_id, hotel_code);
                if (!checkBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                // check already checked in or not with this booking id
                const { data: checkBookingCheckedIn } = yield bookingModel.getAllRoomBookingCheckIn({ booking_id, hotel_code });
                if (checkBookingCheckedIn.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Already checked in by this booking ID",
                    };
                }
                const { check_out_time, pay_status, grand_total, user_id, booking_no } = checkBooking[0];
                // room booking check in time
                const rmb_last_check_in_time = new Date(check_out_time);
                const after_rmb_check_in_time = new Date(check_in);
                if (after_rmb_check_in_time > rmb_last_check_in_time) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Room booking check in time expired, so you can not check in for this booking",
                    };
                }
                if (!pay_status) {
                    const guestModel = this.Model.guestModel(trx);
                    yield guestModel.insertGuestLedger({
                        name: booking_no,
                        amount: grand_total,
                        pay_type: "debit",
                        user_id,
                        hotel_code,
                    });
                    const roomBookingModel = this.Model.roomBookingModel(trx);
                    yield roomBookingModel.updateRoomBooking({ pay_status: 1, reserved_room: 1 }, { id: booking_id });
                }
                // insert room booking check in
                yield bookingModel.insertRoomBookingCheckIn({
                    booking_id,
                    check_in,
                    created_by: id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking checked in",
                };
            }));
        });
    }
    // get all room booking check in
    getAllRoomBookingCheckIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const model = this.Model.roomBookingModel();
            const { data, total } = yield model.getAllRoomBookingCheckIn({
                limit: limit,
                skip: skip,
                hotel_code,
                key: key,
                from_date: from_date,
                to_date: to_date,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
}
exports.default = RoomBookingService;
//# sourceMappingURL=room-booking.service.js.map