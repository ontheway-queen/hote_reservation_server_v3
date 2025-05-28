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
exports.ReservationService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const helperFunction_1 = require("../utlis/library/helperFunction");
class ReservationService extends abstract_service_1.default {
    constructor() {
        super();
    }
    calendar(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { check_in, check_out } = req.query;
            const getAllAvailableRoomsWithType = yield this.Model.reservationModel().calendar({
                hotel_code,
                check_in: check_in,
                check_out: check_out,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getAllAvailableRoomsWithType,
            };
        });
    }
    getAllAvailableRoomsTypeWithAvailableRoomCount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { check_in, check_out } = req.query;
            const getAllAvailableRoomsWithType = yield this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount({
                hotel_code,
                check_in: check_in,
                check_out: check_out,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getAllAvailableRoomsWithType,
            };
        });
    }
    getAllAvailableRoomsTypeForEachDateAvailableRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { check_in, check_out } = req.query;
            const getAllAvailableRoomsWithType = yield this.Model.reservationModel().getAllAvailableRoomsTypeForEachAvailableRoom({
                hotel_code,
                check_in: check_in,
                check_out: check_out,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getAllAvailableRoomsWithType,
            };
        });
    }
    getAllAvailableRoomsByRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { check_in, check_out } = req.query;
            const getAllAvailableRoomsByRoomType = yield this.Model.reservationModel().getAllAvailableRoomsByRoomType({
                hotel_code,
                check_in: check_in,
                check_out: check_out,
                room_type_id: parseInt(req.params.id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getAllAvailableRoomsByRoomType,
            };
        });
    }
    createBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { check_in, check_out, rooms, special_requests, source_id, discount_amount, drop, guest, payment, pickup, reservation_type, service_charge, vat, drop_time, drop_to, pickup_from, pickup_time, is_checked_in, } = req.body;
                const total_nights = lib_1.default.calculateNights(check_in, check_out);
                const reservation_model = this.Model.reservationModel(trx);
                if (reservation_type == "confirm") {
                    let total_room_rent = 0;
                    let total_changed_price = 0;
                    const changeRateRooms = [];
                    // finding total price
                    rooms.forEach((room) => {
                        total_room_rent += room.rate.base_price * room.number_of_rooms;
                        // if (room.rate.changed_price !== room.rate.base_price) {
                        total_changed_price += room.rate.changed_price * room.number_of_rooms;
                        //   changeRateRooms.push({
                        //     rate: room.rate,
                        //     rate_plan_id: room.rate_plan_id,
                        //     room_type_id: room.room_type_id,
                        //   });
                        // }
                    });
                    const total_amount = total_changed_price * total_nights +
                        vat +
                        service_charge -
                        discount_amount;
                    const sub_total = total_changed_price * total_nights + vat + service_charge;
                    // create guest
                    const guestModel = this.Model.guestModel(trx);
                    // check guest
                    const { data: checkGuest } = yield guestModel.getAllGuest({
                        email: guest.email,
                        hotel_code,
                    });
                    let guestID = (checkGuest === null || checkGuest === void 0 ? void 0 : checkGuest.length) && checkGuest[0].id;
                    if (!checkGuest.length) {
                        const insertGuestRes = yield guestModel.createGuest({
                            hotel_code,
                            first_name: guest.first_name,
                            last_name: guest.last_name,
                            nationality: guest.nationality,
                            email: guest.email,
                            phone: guest.phone,
                        });
                        guestID = insertGuestRes[0].id;
                    }
                    // ---------------- booking ------------//
                    const getLastBooking = yield reservation_model.getLastBooking();
                    const lastbookingId = (getLastBooking === null || getLastBooking === void 0 ? void 0 : getLastBooking.length) ? getLastBooking[0].id : 1;
                    const ref = lib_1.default.generateBookingReferenceWithId(`BK`, lastbookingId);
                    console.log({ ref });
                    const bookingRes = yield reservation_model.insertRoomBooking({
                        booking_date: new Date().toLocaleDateString(),
                        booking_reference: ref,
                        check_in,
                        check_out,
                        guest_id: guestID,
                        hotel_code,
                        sub_total: sub_total,
                        status: is_checked_in ? "checked_in" : "confirmed",
                        vat,
                        service_charge,
                        total_amount: total_amount,
                        discount_amount,
                        created_by: req.hotel_admin.id,
                        comments: special_requests,
                        source_id,
                        drop,
                        drop_time,
                        drop_to,
                        pickup,
                        pickup_from,
                        pickup_time,
                    });
                    const bookingRoomsPayload = [];
                    rooms.forEach((room) => {
                        const base_rate = room.rate.base_price * total_nights;
                        const changed_rate = room.rate.changed_price * total_nights;
                        room.guests.forEach((guest) => {
                            bookingRoomsPayload.push({
                                booking_id: bookingRes[0].id,
                                adults: guest.adults,
                                children: guest.children,
                                base_rate: base_rate,
                                changed_rate,
                                infant: guest.infant,
                                room_id: guest.room_id,
                                room_type_id: room.room_type_id,
                            });
                        });
                    });
                    // insert booking rooms
                    yield reservation_model.insertBookingRoom(bookingRoomsPayload);
                    // Get all dates between check_in (inclusive) and check_out (exclusive)
                    const dates = helperFunction_1.HelperFunction.getDatesBetween(check_in, check_out);
                    console.log({ dates });
                    // Sum total rooms reserved per room_type_id
                    const reservedRoom = rooms.map((item) => ({
                        room_type_id: item.room_type_id,
                        total_room: item.guests.length,
                    }));
                    // Update availability per date and room_type_id
                    for (const { room_type_id, total_room } of reservedRoom) {
                        for (const date of dates) {
                            yield reservation_model.updateRoomAvailability({
                                hotel_code,
                                room_type_id,
                                date,
                                rooms_to_book: total_room,
                            });
                        }
                    }
                    // ------------- payment ---------------//
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: { message: "Booking created successfully" },
                };
            }));
        });
    }
    getAllBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.reservationModel().getAllBooking({
                hotel_code: req.hotel_admin.hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.ReservationService = ReservationService;
exports.default = ReservationService;
//# sourceMappingURL=reservation.service.js.map