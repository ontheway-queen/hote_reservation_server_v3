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
                // check room type available or not
                body.rooms.forEach((room) => __awaiter(this, void 0, void 0, function* () {
                    const getAllAvailableRoomsWithType = yield this.Model.reservationModel(trx).getAllAvailableRoomsTypeWithAvailableRoomCount({
                        hotel_code,
                        check_in: body.check_in,
                        check_out: body.check_out,
                        room_type_id: room.room_type_id,
                    });
                    if (room.guests.length > getAllAvailableRoomsWithType[0].available_rooms) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Room Assigned is more than available rooms",
                        };
                    }
                }));
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
                        booking_type: body.reservation_type == "booked" ? "B" : "H",
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
                    total_nights,
                });
                // Rooms
                yield sub.insertBookingRooms(body.rooms, booking.id, total_nights);
                // Availability
                yield sub.updateAvailabilityWhenRoomBooking(body.reservation_type, body.rooms, body.check_in, body.check_out, hotel_code);
                // Payment
                yield sub.handlePaymentAndFolioForBooking(body.is_payment_given, body.payment, guest_id, req, total_amount, booking.id);
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
            const { search, booked_from, booked_to, booking_type, checkin_from, checkin_to, checkout_from, checkout_to, limit, skip, status, } = req.query;
            const { data, total } = yield this.Model.reservationModel().getAllBooking({
                hotel_code: req.hotel_admin.hotel_code,
                search: search,
                booked_from: booked_from,
                booked_to: booked_to,
                booking_type: booking_type,
                checkin_from: checkin_from,
                checkin_to: checkin_to,
                checkout_from: checkout_from,
                checkout_to: checkout_to,
                limit: limit,
                skip: skip,
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
            const data = yield this.Model.reservationModel().getSingleBooking(req.hotel_admin.hotel_code, parseInt(req.params.id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkSingleBooking = yield this.Model.reservationModel().getSingleBooking(req.hotel_admin.hotel_code, parseInt(req.params.id));
            if (!checkSingleBooking) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                // data,
            };
        });
    }
    // public async changeDatesOfBooking(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const { hotel_code } = req.hotel_admin;
    //     const { check_in, check_out } = req.body;
    //     const booking_id = parseInt(req.params.id);
    //     const reservationModel = this.Model.reservationModel(trx);
    //     const invoiceModel = this.Model.hotelInvoiceModel(trx);
    //     const checkSingleBooking = await reservationModel.getSingleBooking(
    //       req.hotel_admin.hotel_code,
    //       booking_id
    //     );
    //     if (!checkSingleBooking) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //         message: this.ResMsg.HTTP_NOT_FOUND,
    //       };
    //     }
    //     const {
    //       booking_rooms,
    //       check_in: prev_checkin,
    //       check_out: prev_checkout,
    //       vat,
    //       discount_amount,
    //       service_charge,
    //       guest_id,
    //     } = checkSingleBooking;
    //     const checkFolioEntries =
    //       await invoiceModel.getFoliosEntriesbySingleBooking({
    //         booking_id,
    //         hotel_code: req.hotel_admin.hotel_code,
    //         type: "primary",
    //       });
    //     const isPayment = checkFolioEntries.find(
    //       (item) => item.posting_type.toLowerCase() === "payment"
    //     );
    //     // calculate new dates room balance
    //     if (prev_checkin == check_in && prev_checkout == check_out) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: "You have requested previous date",
    //       };
    //     }
    //     const sub = new SubReservationService(trx);
    //     const total_nights = sub.calculateNights(check_in, check_out);
    //     // check room type available or not
    //     const uniqueBookingsRoomTypes: {
    //       room_type_id: number;
    //       total_rooms: number;
    //     }[] = [];
    //     for (const room of booking_rooms) {
    //       const existing = uniqueBookingsRoomTypes.find(
    //         (item) => item.room_type_id === room.room_type_id
    //       );
    //       if (existing) {
    //         existing.total_rooms += 1;
    //       } else {
    //         uniqueBookingsRoomTypes.push({
    //           room_type_id: room.room_type_id,
    //           total_rooms: 1,
    //         });
    //       }
    //     }
    //     for (const roomType of uniqueBookingsRoomTypes) {
    //       const available =
    //         await this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount(
    //           {
    //             hotel_code,
    //             check_in: check_in,
    //             check_out: check_out,
    //             room_type_id: roomType.room_type_id,
    //           }
    //         );
    //       if (roomType.total_rooms > available[0].available_rooms) {
    //         return {
    //           success: false,
    //           code: this.StatusCode.HTTP_NOT_FOUND,
    //           message: "Room Assigned is more than available rooms",
    //         };
    //       }
    //     }
    //     // Totals
    //     const { total_amount, sub_total } = sub.calculateTotalsByBookingRooms(
    //       booking_rooms,
    //       total_nights,
    //       {
    //         vat,
    //         service_charge: service_charge,
    //         discount: discount_amount,
    //       }
    //     );
    //     // update room booking
    //     await reservationModel.updateRoomBooking(
    //       {
    //         total_amount,
    //         sub_total,
    //       },
    //       hotel_code,
    //       booking_id
    //     );
    //     // delete booking rooms
    //     const roomIDs = booking_rooms.map((room) => room.room_id);
    //     await reservationModel.deleteBookingRooms(hotel_code, roomIDs);
    //     // insert booking rooms
    //     await sub.insertInBookingRoomsBySingleBookingRooms(
    //       booking_rooms,
    //       booking_id,
    //       total_nights
    //     );
    //     // room avaibility decrease
    //     await sub.updateRoomAvailabilityService(
    //       "booked_room_decrease",
    //       booking_rooms,
    //       prev_checkin,
    //       prev_checkout,
    //       hotel_code
    //     );
    //     // room avaibility increase
    //     await sub.updateRoomAvailabilityService(
    //       "booked_room_increase",
    //       booking_rooms,
    //       check_in,
    //       check_out,
    //       hotel_code
    //     );
    //     const entryIds = checkFolioEntries.map((entry) => entry.entries_id);
    //     if (!isPayment) {
    //       // delete entry IDs
    //       await invoiceModel.updateFolioEntries({ is_void: true }, entryIds);
    //       await invoiceModel.insertInFolioEntries({
    //         debit: total_amount,
    //         credit: 0,
    //         folio_id: checkFolioEntries[0].id,
    //         posting_type: "Charge",
    //       });
    //     } else {
    //       // first void
    //       // delete entry IDs
    //       await invoiceModel.updateFolioEntries({ is_void: true }, entryIds);
    //       // then reversal
    //       const insertReversalEntries: IinsertFolioEntriesPayload[] = [];
    //       checkFolioEntries.forEach((entry) => {
    //         if (entry.posting_type.toLowerCase() == "charge") {
    //           insertReversalEntries.push({
    //             debit: -entry.debit,
    //             folio_id: checkFolioEntries[0].id,
    //             posting_type: "Charge",
    //             description: "Reversed amount for new room charge",
    //           });
    //         }
    //       });
    //       await invoiceModel.insertInFolioEntries(insertReversalEntries);
    //       // new chage add
    //       await invoiceModel.insertInFolioEntries({
    //         debit: total_amount,
    //         credit: 0,
    //         folio_id: checkFolioEntries[0].id,
    //         posting_type: "Charge",
    //       });
    //     }
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_OK,
    //       message: this.ResMsg.HTTP_OK,
    //     };
    //   });
    // }
    changeDatesOfBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { check_in, check_out } = req.body;
                const booking_id = parseInt(req.params.id);
                const reservationModel = this.Model.reservationModel(trx);
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                const booking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { booking_rooms, check_in: prev_checkin, check_out: prev_checkout, vat, discount_amount, service_charge, } = booking;
                // Prevent changing to the same dates
                if (prev_checkin === check_in && prev_checkout === check_out) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "You have requested previous date",
                    };
                }
                // Check availability grouped by room type
                const roomTypeMap = new Map();
                for (const room of booking_rooms) {
                    roomTypeMap.set(room.room_type_id, (roomTypeMap.get(room.room_type_id) || 0) + 1);
                }
                for (const [room_type_id, total_rooms] of roomTypeMap.entries()) {
                    const available = yield this.Model.reservationModel().getAllAvailableRoomsTypeWithAvailableRoomCount({
                        hotel_code,
                        check_in,
                        check_out,
                        room_type_id,
                    });
                    if (available.length && total_rooms > available[0].available_rooms) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Room Assigned is more than available rooms",
                        };
                    }
                }
                // Recalculate totals
                const sub = new subreservation_service_1.SubReservationService(trx);
                const total_nights = sub.calculateNights(check_in, check_out);
                const { total_amount, sub_total } = sub.calculateTotalsByBookingRooms(booking_rooms, total_nights, { vat, service_charge, discount: discount_amount });
                console.log({ total_amount, sub_total, booking_id, hotel_code });
                // Update booking totals
                yield reservationModel.updateRoomBooking({ total_amount, sub_total, total_nights, check_out, check_in }, hotel_code, booking_id);
                // Update booking rooms
                const roomIDs = booking_rooms.map((room) => room.room_id);
                yield reservationModel.deleteBookingRooms(roomIDs);
                yield sub.insertInBookingRoomsBySingleBookingRooms(booking_rooms, booking_id, total_nights);
                // Update room availability
                yield sub.updateRoomAvailabilityService("booked_room_decrease", booking_rooms, prev_checkin, prev_checkout, hotel_code);
                yield sub.updateRoomAvailabilityService("booked_room_increase", booking_rooms, check_in, check_out, hotel_code);
                // Handle folio entries
                const folioEntries = yield invoiceModel.getFoliosEntriesbySingleBooking({
                    booking_id,
                    hotel_code,
                    type: "primary",
                });
                if (!folioEntries.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No folio entries found.",
                    };
                }
                const folio_id = folioEntries[0].id;
                const entryIds = folioEntries.map((entry) => entry.entries_id);
                const hasPayment = folioEntries.some((entry) => entry.posting_type.toLowerCase() === "payment");
                // Mark all old entries as void
                yield invoiceModel.updateFolioEntries({ is_void: true }, entryIds);
                if (hasPayment) {
                    // Insert reversal entries
                    const reversals = folioEntries
                        .filter((entry) => entry.posting_type.toLowerCase() === "charge")
                        .map((entry) => ({
                        debit: -entry.debit,
                        credit: 0,
                        folio_id,
                        posting_type: "Charge",
                        description: "Reversed previous room charge due to date change",
                    }));
                    if (reversals.length) {
                        yield invoiceModel.insertInFolioEntries(reversals);
                    }
                }
                // Insert new charge entry
                yield invoiceModel.insertInFolioEntries({
                    debit: total_amount,
                    folio_id,
                    posting_type: "Charge",
                    description: "New room charge after date change",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "The dates of the reservation have been modified",
                };
            }));
        });
    }
    checkIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            const booking_id = parseInt(req.params.id);
            const data = yield this.Model.reservationModel().getSingleBooking(hotel_code, booking_id);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { status } = data;
            if (status != "confirmed") {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "This booking has other status. So, you cannot checkin",
                };
            }
            // update
            yield this.Model.reservationModel().updateRoomBooking({
                status: "checked_in",
            }, hotel_code, booking_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Successfully Cheked in",
            };
        });
    }
    checkOut(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const booking_id = parseInt(req.params.id);
                const reservationModel = this.Model.reservationModel(trx);
                const sub = new subreservation_service_1.SubReservationService(trx);
                const data = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { status, booking_type, booking_rooms, check_in, check_out } = data;
                if (booking_type != "B" && status != "checked_in") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "This booking has other status. So, you cannot checkout",
                    };
                }
                // check  due balance exist or not
                const hotelInvoiceModel = this.Model.hotelInvoiceModel(trx);
                const checkDueAmount = yield hotelInvoiceModel.getDueAmountByBookingID({
                    booking_id,
                    hotel_code,
                });
                console.log({ checkDueAmount });
                if (checkDueAmount > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: `This guest has ${checkDueAmount} due. So you cannot checkout`,
                    };
                }
                // room avaibility decrease
                yield sub.updateRoomAvailabilityService("booked_room_decrease", booking_rooms, check_in, check_out, hotel_code);
                // update
                yield reservationModel.updateRoomBooking({
                    status: "checked_out",
                }, hotel_code, booking_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully Cheked out",
                };
            }));
        });
    }
    updateReservationHoldStatus(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const booking_id = parseInt(req.params.id);
                const { status: reservation_type_status } = req.body;
                const sub = new subreservation_service_1.SubReservationService(trx);
                const data = yield this.Model.reservationModel().getSingleBooking(hotel_code, booking_id);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { booking_type, status, booking_rooms, check_in, check_out } = data;
                if (booking_type != "H" && status !== "confirmed") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "This booking has other status. So, you cannot changed",
                    };
                }
                if (reservation_type_status == "confirmed") {
                    // update
                    yield this.Model.reservationModel().updateRoomBooking({
                        booking_type: "B",
                        status: "confirmed",
                    }, hotel_code, booking_id);
                    // Availability
                    yield sub.updateRoomAvailabilityForHoldService("hold_decrease", booking_rooms, check_in, check_out, hotel_code);
                    yield sub.updateRoomAvailabilityService("booked_room_increase", booking_rooms, check_in, check_out, hotel_code);
                    // update room availability
                }
                else if (reservation_type_status == "canceled") {
                    // update
                    yield this.Model.reservationModel().updateRoomBooking({
                        booking_type: "H",
                        status: "canceled",
                    }, hotel_code, booking_id);
                    // Availability
                    yield sub.updateRoomAvailabilityForHoldService("hold_decrease", booking_rooms, check_in, check_out, hotel_code);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully updated",
                };
            }));
        });
    }
    getFoliosbySingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.hotelInvoiceModel().getFoliosbySingleBooking(req.hotel_admin.hotel_code, parseInt(req.params.id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getFoliosWithEntriesbySingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.hotelInvoiceModel().getFoliosWithEntriesbySingleBooking({
                hotel_code: req.hotel_admin.hotel_code,
                booking_id: parseInt(req.params.id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getFolioEntriesbyFolioID(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.hotelInvoiceModel().getFolioEntriesbyFolioID(req.hotel_admin.hotel_code, parseInt(req.params.id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    addPaymentByFolioID(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { acc_id, amount, folio_id, payment_date, remarks } = req.body;
                const sub = new subreservation_service_1.SubReservationService(trx);
                const invModel = this.Model.hotelInvoiceModel(trx);
                const checkSingleFolio = yield invModel.getSingleFoliobyHotelCodeAndFolioID(req.hotel_admin.hotel_code, folio_id);
                if (!checkSingleFolio) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                // insert entries
                yield sub.handlePaymentAndFolioForAddPayment({
                    acc_id,
                    amount,
                    folio_id,
                    guest_id: checkSingleFolio.guest_id,
                    payment_for: "ADD MONEY",
                    remarks,
                    req,
                    payment_date,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Payment has been added",
                };
            }));
        });
    }
    refundPaymentByFolioID(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { acc_id, amount, folio_id, payment_date, payment_type, remarks } = req.body;
                const sub = new subreservation_service_1.SubReservationService(trx);
                const invModel = this.Model.hotelInvoiceModel(trx);
                const checkSingleFolio = yield invModel.getSingleFoliobyHotelCodeAndFolioID(req.hotel_admin.hotel_code, folio_id);
                if (!checkSingleFolio) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                // insert entries
                yield sub.handlePaymentAndFolioForRefundPayment({
                    acc_id,
                    amount,
                    folio_id,
                    guest_id: checkSingleFolio.guest_id,
                    payment_for: "REFUND",
                    remarks,
                    req,
                    payment_date,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Payment has been refunded",
                };
            }));
        });
    }
    adjustAmountByFolioID(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { amount, folio_id, remarks } = req.body;
                const invModel = this.Model.hotelInvoiceModel(trx);
                const checkSingleFolio = yield invModel.getSingleFoliobyHotelCodeAndFolioID(req.hotel_admin.hotel_code, folio_id);
                if (!checkSingleFolio) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield this.Model.hotelInvoiceModel().insertInFolioEntries({
                    debit: -amount,
                    credit: 0,
                    folio_id: folio_id,
                    posting_type: "Adjustment",
                    description: remarks,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    addItemByFolioID(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { amount, folio_id, remarks } = req.body;
                const invModel = this.Model.hotelInvoiceModel(trx);
                const checkSingleFolio = yield invModel.getSingleFoliobyHotelCodeAndFolioID(req.hotel_admin.hotel_code, folio_id);
                if (!checkSingleFolio) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield this.Model.hotelInvoiceModel().insertInFolioEntries({
                    debit: amount,
                    folio_id: folio_id,
                    posting_type: "Charge",
                    description: remarks,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.ReservationService = ReservationService;
exports.default = ReservationService;
//# sourceMappingURL=reservation.service.js.map