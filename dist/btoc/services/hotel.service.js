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
exports.BtocHotelService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const helperFunction_1 = require("../../appAdmin/utlis/library/helperFunction");
const btoc_subHotel_service_1 = require("./btoc.subHotel.service");
class BtocHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    searchAvailability(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const { checkin, checkout, client_nationality, rooms } = req.body;
            const nights = helperFunction_1.HelperFunction.calculateNights(checkin, checkout);
            const getAllAvailableRooms = yield this.BtocModels.btocReservationModel().getAllRoomRatesBTOC({
                hotel_code,
                nights,
                checkin: checkin,
                checkout: checkout,
                rooms,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    total: getAllAvailableRooms.length,
                    no_of_nights: nights,
                    checkin,
                    checkout,
                    no_of_rooms: rooms.length,
                    data: getAllAvailableRooms,
                },
            };
        });
    }
    recheck(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const { checkin, checkout, rooms, room_type_id, rate_plan_id } = req.body;
            const nights = helperFunction_1.HelperFunction.calculateNights(checkin, checkout);
            const getAvailableRoom = yield this.BtocModels.btocReservationModel().recheck({
                hotel_code,
                nights,
                checkin: checkin,
                checkout: checkout,
                rooms,
                rate_plan_id,
                room_type_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    no_of_nights: nights,
                    checkin,
                    checkout,
                    no_of_rooms: rooms.length,
                    data: getAvailableRoom,
                },
            };
        });
    }
    booking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.web_token;
                const { checkin, checkout, room_type_id, rate_plan_id, rooms, special_requests, holder, } = req.body;
                const totalRequested = rooms.length;
                const nights = helperFunction_1.HelperFunction.calculateNights(checkin, checkout);
                const recheck = yield this.BtocModels.btocReservationModel().recheck({
                    hotel_code,
                    nights,
                    checkin: checkin,
                    checkout: checkout,
                    rooms,
                    rate_plan_id,
                    room_type_id,
                });
                if (!recheck) {
                    throw new Error("Room not available for booking");
                }
                const sub = new btoc_subHotel_service_1.SubBtocHotelService(trx);
                // Insert or get lead guest
                const guest_id = yield sub.findOrCreateGuest(holder, hotel_code);
                // Create main booking
                const booking = yield sub.createMainBooking({
                    payload: {
                        is_individual_booking: true,
                        check_in: checkin,
                        check_out: checkout,
                        created_by: req.btoc_user.id,
                        booking_type: "B",
                        special_requests,
                        payment_status: "unpaid",
                    },
                    hotel_code,
                    guest_id,
                    total_nights: nights,
                    total_amount: recheck.price,
                    sub_total: recheck.price,
                });
                const booked_room_types = [];
                const bookedRooms = [];
                rooms.forEach((room) => {
                    var _a;
                    bookedRooms.push({
                        check_in: checkin,
                        check_out: checkout,
                        adults: room.adults,
                        children: room.children_ages.length,
                        rate: {
                            base_rate: recheck.rate.base_rate,
                            changed_rate: recheck.rate.base_rate,
                        },
                        guest_info: (_a = room === null || room === void 0 ? void 0 : room.paxes) === null || _a === void 0 ? void 0 : _a.map((pax) => ({
                            first_name: pax.name,
                            last_name: pax.surname,
                            is_room_primary_guest: false,
                            type: pax.type === "AD" ? "adult" : "child",
                        })),
                    });
                    booked_room_types.push({
                        room_type_id,
                        rate_plan_id,
                        rooms: bookedRooms,
                    });
                });
                console.log({ booked_room_types });
                // Insert booking rooms
                yield sub.insertBookingRooms({
                    booked_room_types,
                    booking_id: booking.id,
                    hotel_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    booking_ref: booking.booking_ref,
                };
            }));
        });
    }
    getAllBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const { search, limit, skip, booking_type, status } = req.query;
            const { data, total } = yield this.BtocModels.btocReservationModel().getAllBooking({
                hotel_code,
                search: search,
                user_id: req.btoc_user.id,
                limit: limit,
                skip: skip,
                booking_type: booking_type,
                status: status,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const { ref_id } = req.params;
            const data = yield this.BtocModels.btocReservationModel().getSingleBooking({
                hotel_code,
                user_id: req.btoc_user.id,
                ref_id: ref_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    cancelSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.web_token;
            const { ref_id } = req.params;
            const data = yield this.BtocModels.btocReservationModel().getSingleBooking({
                hotel_code,
                user_id: req.btoc_user.id,
                ref_id: ref_id,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Booking not found",
                };
            }
            if (data.status !== "pending" &&
                data.booking_type === "B" &&
                (data.payment_status === "unpaid" || !data.payment_status)) {
                yield this.BtocModels.btocReservationModel().cancelSingleBooking({
                    hotel_code,
                    user_id: req.btoc_user.id,
                    ref_id: ref_id,
                });
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Booking cannot be canceled, Only pending bookings can be canceled",
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
            };
        });
    }
}
exports.BtocHotelService = BtocHotelService;
//# sourceMappingURL=hotel.service.js.map