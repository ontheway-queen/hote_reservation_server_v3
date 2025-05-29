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
const subreservation_service_1 = require("./subreservation.service");
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
    // public async createBooking(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const { hotel_code, hotel_name } = req.hotel_admin;
    //     const {
    //       check_in,
    //       check_out,
    //       rooms,
    //       special_requests,
    //       source_id,
    //       discount_amount,
    //       drop,
    //       guest,
    //       payment,
    //       pickup,
    //       reservation_type,
    //       service_charge,
    //       vat,
    //       drop_time,
    //       drop_to,
    //       pickup_from,
    //       pickup_time,
    //       is_checked_in,
    //     } = req.body as BookingRequestBody;
    //     const total_nights = Lib.calculateNights(check_in, check_out);
    //     const reservation_model = this.Model.reservationModel(trx);
    //     if (reservation_type == "confirm") {
    //       let total_room_rent = 0;
    //       let total_changed_price = 0;
    //       const changeRateRooms: {
    //         room_type_id: number;
    //         rate_plan_id: number;
    //         rate: {
    //           base_price: number;
    //           changed_price: number;
    //         };
    //       }[] = [];
    //       // finding total price
    //       rooms.forEach((room) => {
    //         total_room_rent += room.rate.base_price * room.number_of_rooms;
    //         total_changed_price += room.rate.changed_price * room.number_of_rooms;
    //       });
    //       const total_amount =
    //         total_changed_price * total_nights +
    //         vat +
    //         service_charge -
    //         discount_amount;
    //       const sub_total =
    //         total_changed_price * total_nights + vat + service_charge;
    //       // create guest
    //       const guestModel = this.Model.guestModel(trx);
    //       // check guest
    //       const { data: checkGuest } = await guestModel.getAllGuest({
    //         email: guest.email,
    //         hotel_code,
    //       });
    //       let guestID = checkGuest?.length && checkGuest[0].id;
    //       if (!checkGuest.length) {
    //         const insertGuestRes = await guestModel.createGuest({
    //           hotel_code,
    //           first_name: guest.first_name,
    //           last_name: guest.last_name,
    //           nationality: guest.nationality,
    //           email: guest.email,
    //           phone: guest.phone,
    //         });
    //         guestID = insertGuestRes[0].id;
    //       }
    //       // ---------------- booking ------------//
    //       const getLastBooking = await reservation_model.getLastBooking();
    //       const lastbookingId = getLastBooking?.length ? getLastBooking[0].id : 1;
    //       const ref = Lib.generateBookingReferenceWithId(`BK`, lastbookingId);
    //       const bookingRes = await reservation_model.insertRoomBooking({
    //         booking_date: new Date().toLocaleDateString(),
    //         booking_reference: ref,
    //         check_in,
    //         check_out,
    //         guest_id: guestID,
    //         hotel_code,
    //         sub_total: sub_total,
    //         status: is_checked_in ? "checked_in" : "confirmed",
    //         vat,
    //         service_charge,
    //         total_amount: total_amount,
    //         discount_amount,
    //         created_by: req.hotel_admin.id,
    //         comments: special_requests,
    //         source_id,
    //         drop,
    //         drop_time,
    //         drop_to,
    //         pickup,
    //         pickup_from,
    //         pickup_time,
    //       });
    // const bookingRoomsPayload: IbookingRooms[] = [];
    //       rooms.forEach((room) => {
    //         const base_rate = room.rate.base_price * total_nights;
    //         const changed_rate = room.rate.changed_price * total_nights;
    //         room.guests.forEach((guest) => {
    //           bookingRoomsPayload.push({
    //             booking_id: bookingRes[0].id,
    //             adults: guest.adults,
    //             children: guest.children,
    //             base_rate: base_rate,
    //             changed_rate,
    //             infant: guest.infant,
    //             room_id: guest.room_id,
    //             room_type_id: room.room_type_id,
    //           });
    //         });
    //       });
    //       // insert booking rooms
    //       await reservation_model.insertBookingRoom(bookingRoomsPayload);
    //       // Get all dates between check_in (inclusive) and check_out (exclusive)
    //       const dates = HelperFunction.getDatesBetween(check_in, check_out);
    //       console.log({ dates });
    //       // Sum total rooms reserved per room_type_id
    //       const reservedRoom = rooms.map((item) => ({
    //         room_type_id: item.room_type_id,
    //         total_room: item.guests.length,
    //       }));
    //       // Update availability per date and room_type_id
    //       for (const { room_type_id, total_room } of reservedRoom) {
    //         for (const date of dates) {
    //           await reservation_model.updateRoomAvailability({
    //             hotel_code,
    //             room_type_id,
    //             date,
    //             rooms_to_book: total_room,
    //           });
    //         }
    //       }
    //       // ------------- payment ---------------//
    //       const accountModel = this.Model.accountModel(trx);
    //       const checkAccount = await accountModel.getSingleAccount({
    //         hotel_code,
    //         id: payment.acc_id,
    //       });
    //       if (!checkAccount.length) {
    //         return {
    //           success: false,
    //           code: this.StatusCode.HTTP_NOT_FOUND,
    //           message: "Invalid Account",
    //         };
    //       }
    //       const generatedVoucher = await new HelperFunction().generateVoucherNo();
    //       const accountVoucherRes = await accountModel.insertAccVoucher({
    //         acc_head_id: checkAccount[0].acc_head_id,
    //         created_by: req.hotel_admin.id,
    //         debit: payment.amount,
    //         credit: 0,
    //         description: "For room booking payment",
    //         payment_type: "PAYMENT",
    //         voucher_date: new Date().toISOString(),
    //         voucher_no: generatedVoucher,
    //         payment_method: "Bank",
    //       });
    //       const hotelInvModel = this.Model.hotelInvoiceModel(trx);
    //       const getLastFolioId = await hotelInvModel.getLasFolioId();
    //       const generatedFolioNumber = HelperFunction.generateFolioNumber(
    //         getLastFolioId[0]?.id
    //       );
    //       const folioRes = await hotelInvModel.insertInFolio({
    //         folio_number: generatedFolioNumber,
    //         guest_id: guestID,
    //         hotel_code,
    //         name: "Room Booking",
    //         status: "open",
    //         type: "Primary",
    //       });
    //       await hotelInvModel.insertInFolioEntries({
    //         acc_voucher_id: accountVoucherRes[0].id,
    //         debit: total_amount,
    //         credit: 0,
    //         folio_id: folioRes[0].id,
    //         posting_type: "Charge",
    //         status: "open",
    //       });
    //       await hotelInvModel.insertInFolioEntries({
    //         acc_voucher_id: accountVoucherRes[0].id,
    //         debit: 0,
    //         credit: payment.amount,
    //         folio_id: folioRes[0].id,
    //         posting_type: "Charge",
    //         status: "open",
    //       });
    //       // guest ledger
    //       await this.Model.guestModel().insertGuestLedger({
    //         hotel_code,
    //         credit: payment.amount,
    //         debit: 0,
    //         guest_id: guestID,
    //       });
    //       await this.Model.guestModel().insertGuestLedger({
    //         hotel_code,
    //         credit: 0,
    //         debit: total_amount,
    //         guest_id: guestID,
    //       });
    //     }
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_SUCCESSFUL,
    //       data: { message: "Booking created successfully" },
    //     };
    //   });
    // }
    createBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                const sub = new subreservation_service_1.SubReservationService(trx);
                const total_nights = sub.calculateNights(body.check_in, body.check_out);
                // Guest
                const guest_id = yield sub.findOrCreateGuest(body.guest, hotel_code);
                // Totals
                const { total_amount, sub_total } = sub.calculateTotals(body.rooms, total_nights, {
                    vat: body.vat,
                    service_charge: body.service_charge,
                    discount: body.discount_amount,
                });
                // Booking
                const booking = yield sub.createMainBooking({
                    payload: {
                        check_in: body.check_in,
                        check_out: body.check_out,
                        created_by: req.hotel_admin.id,
                        discount_amount: body.discount_amount,
                        drop: body.drop,
                        drop_time: body.drop_time,
                        pickup_from: body.pickup_from,
                        pickup: body.pickup,
                        source_id: body.source_id,
                        drop_to: body.drop_to,
                        special_requests: body.special_requests,
                        vat: body.vat,
                        pickup_time: body.pickup_time,
                        service_charge: body.service_charge,
                    },
                    hotel_code,
                    guest_id,
                    sub_total,
                    total_amount,
                    is_checked_in: body.is_checked_in,
                });
                // Rooms
                yield sub.insertBookingRooms(body.rooms, booking.id, total_nights);
                // Availability
                yield sub.updateAvailability(body.rooms, body.check_in, body.check_out, hotel_code);
                // Payment
                yield sub.handlePaymentAndFolio(body.payment, guest_id, req, total_amount, booking.id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking created successfully",
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