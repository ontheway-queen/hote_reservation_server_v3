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
const helperFunction_1 = require("../utlis/library/helperFunction");
const subreservation_service_1 = require("./subreservation.service");
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
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
                var _a, _b;
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                const { check_in, check_out, booked_room_types, vat, service_charge, is_individual_booking, reservation_type, discount_amount, pickup, drop, drop_time, pickup_time, pickup_from, drop_to, source_id, special_requests, is_company_booked, company_name, visit_purpose, is_checked_in, service_charge_percentage, vat_percentage, } = body;
                const sub = new subreservation_service_1.SubReservationService(trx);
                // Calculate total nights
                const total_nights = sub.calculateNights(check_in, check_out);
                if (total_nights <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Check-in date must be before check-out date",
                    };
                }
                const reservationModel = this.Model.reservationModel(trx);
                // Validate room availability
                for (const rt of booked_room_types) {
                    // check how many rooms available by room types
                    const availableRooms = yield reservationModel.getAllAvailableRoomsTypeWithAvailableRoomCount({
                        hotel_code,
                        check_in,
                        check_out,
                        room_type_id: rt.room_type_id,
                    });
                    if (rt.rooms.length > (((_a = availableRooms[0]) === null || _a === void 0 ? void 0 : _a.available_rooms) || 0)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Room Assigned is more than available rooms",
                        };
                    }
                    // check rooms available or not
                    const availableRoomList = yield reservationModel.getAllAvailableRoomsByRoomType({
                        hotel_code,
                        check_in,
                        check_out,
                        room_type_id: rt.room_type_id,
                    });
                    for (const room of rt.rooms) {
                        const isRoomAvailable = availableRoomList.some((avr) => {
                            return avr.room_id === room.room_id;
                        });
                        if (!isRoomAvailable) {
                            // get single room which is not available
                            const getSingleRoom = yield this.Model.RoomModel().getSingleRoom(hotel_code, room.room_id);
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: `Room No ${(_b = getSingleRoom[0]) === null || _b === void 0 ? void 0 : _b.room_name} not available`,
                            };
                        }
                    }
                }
                // Insert or get lead guest
                const guest_id = yield sub.findOrCreateGuest(body.lead_guest_info, hotel_code);
                // Create main booking
                const booking = yield sub.createMainBooking({
                    payload: {
                        is_individual_booking,
                        check_in,
                        check_out,
                        created_by: req.hotel_admin.id,
                        discount_amount,
                        drop,
                        booking_type: reservation_type === "booked" ? "B" : "H",
                        drop_time,
                        pickup_from,
                        pickup,
                        source_id,
                        drop_to,
                        special_requests,
                        vat,
                        pickup_time,
                        service_charge,
                        is_company_booked,
                        company_name,
                        visit_purpose,
                        service_charge_percentage,
                        vat_percentage,
                    },
                    hotel_code,
                    guest_id,
                    is_checked_in,
                    total_nights,
                });
                // Insert booking rooms
                yield sub.insertBookingRooms({
                    booked_room_types,
                    booking_id: booking.id,
                    nights: total_nights,
                    hotel_code,
                    is_checked_in,
                });
                // Update availability
                yield sub.updateAvailabilityWhenRoomBooking(reservation_type, booked_room_types, hotel_code);
                // Create folio and ledger entries
                yield sub.createRoomBookingFolioWithEntries({
                    body,
                    guest_id,
                    booking_id: booking.id,
                    booking_ref: booking.booking_ref,
                    req,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking created successfully",
                    data: {
                        booking_id: booking.id,
                    },
                };
            }));
        });
    }
    createGroupBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                const { check_in, check_out, booked_room_types, vat, service_charge, is_individual_booking, reservation_type, discount_amount, pickup, drop, drop_time, pickup_time, pickup_from, drop_to, source_id, special_requests, is_company_booked, company_name, visit_purpose, is_checked_in, service_charge_percentage, vat_percentage, } = body;
                const sub = new subreservation_service_1.SubReservationService(trx);
                // Calculate total nights
                const total_nights = sub.calculateNights(check_in, check_out);
                if (total_nights <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Check-in date must be before check-out date",
                    };
                }
                const reservationModel = this.Model.reservationModel(trx);
                // Validate room availability
                for (const rt of booked_room_types) {
                    const availableRooms = yield reservationModel.getAllAvailableRoomsTypeWithAvailableRoomCount({
                        hotel_code,
                        check_in,
                        check_out,
                        room_type_id: rt.room_type_id,
                    });
                    if (rt.rooms.length > (((_a = availableRooms[0]) === null || _a === void 0 ? void 0 : _a.available_rooms) || 0)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Room Assigned is more than available rooms",
                        };
                    }
                    // check rooms available or not
                    const availableRoomList = yield reservationModel.getAllAvailableRoomsByRoomType({
                        hotel_code,
                        check_in,
                        check_out,
                        room_type_id: rt.room_type_id,
                    });
                    for (const room of rt.rooms) {
                        const isRoomAvailable = availableRoomList.some((avr) => {
                            return avr.room_id === room.room_id;
                        });
                        // get single room which is not available
                        const getSingleRoom = yield this.Model.RoomModel().getSingleRoom(hotel_code, room.room_id);
                        if (!isRoomAvailable) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: `Room No ${(_b = getSingleRoom[0]) === null || _b === void 0 ? void 0 : _b.room_name} not available`,
                            };
                        }
                    }
                }
                // Insert or get lead guest
                const guest_id = yield sub.findOrCreateGuest(body.lead_guest_info, hotel_code);
                // Create main booking
                const booking = yield sub.createMainBooking({
                    payload: {
                        is_individual_booking,
                        check_in,
                        check_out,
                        created_by: req.hotel_admin.id,
                        discount_amount,
                        drop,
                        booking_type: reservation_type === "booked" ? "B" : "H",
                        drop_time,
                        pickup_from,
                        pickup,
                        source_id,
                        drop_to,
                        special_requests,
                        vat,
                        pickup_time,
                        service_charge,
                        is_company_booked,
                        company_name,
                        visit_purpose,
                        service_charge_percentage,
                        vat_percentage,
                    },
                    hotel_code,
                    guest_id,
                    is_checked_in,
                    total_nights,
                });
                // Insert booking rooms
                yield sub.insertBookingRoomsForGroupBooking({
                    booked_room_types,
                    booking_id: booking.id,
                    hotel_code,
                    is_checked_in,
                });
                // Update availability
                yield sub.updateAvailabilityWhenRoomBooking(reservation_type, booked_room_types, hotel_code);
                // Create folio and ledger entries
                yield sub.createGroupRoomBookingFolios({
                    body,
                    guest_id,
                    booking_id: booking.id,
                    req,
                    booking_ref: booking.booking_ref,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking created successfully",
                    data: {
                        booking_id: booking.id,
                    },
                };
            }));
        });
    }
    getAllBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, booked_from, booked_to, booking_type, checkin_from, checkin_to, checkout_from, checkout_to, limit, skip, status, } = req.query;
            console.log({ status });
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
    getAllIndividualBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, booked_from, booked_to, booking_type, checkin_from, checkin_to, checkout_from, checkout_to, limit, skip, status, } = req.query;
            const { data, total } = yield this.Model.reservationModel().getAllIndividualBooking({
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
    getAllGroupBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, booked_from, booked_to, booking_type, checkin_from, checkin_to, checkout_from, checkout_to, limit, skip, status, } = req.query;
            const { data, total } = yield this.Model.reservationModel().getAllGroupBooking({
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
    getArrivalDepStayBookings(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this.Model.reservationModel().getArrivalDepStayBookings({
                hotel_code: req.hotel_admin.hotel_code,
                booking_mode: req.query.booking_mode,
                limit: req.query.limit,
                skip: req.query.skip,
                search: req.query.search,
                current_date: req.query.current_date,
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
    cancelBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const created_by = req.hotel_admin.id;
                const booking_id = parseInt(req.params.id);
                const reservationModel = this.Model.reservationModel(trx);
                const invModel = this.Model.hotelInvoiceModel(trx);
                const booking = yield reservationModel.getSingleBooking(req.hotel_admin.hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { booking_rooms, voucher_no, booking_reference: booking_ref, } = booking;
                // update booking by Booking Type C
                yield reservationModel.updateRoomBooking({ booking_type: "C" }, hotel_code, booking_id);
                const sub = new subreservation_service_1.SubReservationService(trx);
                // update availability
                const remainCheckOutRooms = booking_rooms === null || booking_rooms === void 0 ? void 0 : booking_rooms.filter((room) => room.status !== "checked_out");
                if (remainCheckOutRooms === null || remainCheckOutRooms === void 0 ? void 0 : remainCheckOutRooms.length) {
                    yield sub.updateRoomAvailabilityService({
                        reservation_type: "booked_room_decrease",
                        rooms: remainCheckOutRooms,
                        hotel_code,
                    });
                }
                // Accounting
                const { total_debit, total_credit } = yield invModel.getFolioEntriesCalculationByBookingID({
                    hotel_code,
                    booking_id,
                });
                const helper = new helperFunction_1.HelperFunction();
                const hotelModel = this.Model.HotelModel(trx);
                const accountModel = this.Model.accountModel(trx);
                const today = new Date().toISOString().split("T")[0];
                const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                    "RECEIVABLE_HEAD_ID",
                    "HOTEL_REVENUE_HEAD_ID",
                ]);
                const voucher_no1 = yield helper.generateVoucherNo("JV", trx);
                console.log({ heads, hotel_code });
                const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
                if (!receivable_head) {
                    throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
                }
                const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
                if (!sales_head) {
                    throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
                }
                yield accountModel.insertAccVoucher([
                    {
                        acc_head_id: receivable_head.head_id,
                        created_by,
                        debit: 0,
                        credit: total_debit - total_credit,
                        description: `Receivable for Cancel a reservation. Booking Ref ${booking_ref}`,
                        voucher_date: today,
                        voucher_no: voucher_no1,
                        hotel_code,
                    },
                    {
                        acc_head_id: sales_head.head_id,
                        created_by,
                        debit: total_debit - total_credit,
                        credit: 0,
                        description: `Sales for Cancel a reservation ${booking_ref}`,
                        voucher_date: today,
                        voucher_no: voucher_no1,
                        hotel_code,
                    },
                ]);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully Canceled",
                };
            }));
        });
    }
    checkIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            const booking_id = parseInt(req.params.id);
            const model = this.Model.reservationModel();
            const data = yield model.getSingleBooking(hotel_code, booking_id);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { status, check_in } = data;
            if (status != "confirmed") {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "This booking has other status. So, you cannot checkin",
                };
            }
            if (check_in > new Date().toISOString()) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: `You can only check in when the check-in date is or after ${check_in}`,
                };
            }
            // update
            yield model.updateRoomBooking({
                status: "checked_in",
            }, hotel_code, booking_id);
            // update booking rooms
            yield model.updateAllBookingRoomsByBookingID({ status: "checked_in", checked_in_at: new Date().toISOString() }, { booking_id, exclude_checkout: true });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Successfully Cheked in",
            };
        });
    }
    individualRoomCheckIn(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel_code = req.hotel_admin.hotel_code;
            const booking_id = parseInt(req.params.id);
            const model = this.Model.reservationModel();
            const data = yield model.getSingleBooking(hotel_code, booking_id);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            if (data.check_in > new Date().toISOString()) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: `You can only check in when the check-in date is or after ${data.check_in}`,
                };
            }
            // update booking rooms
            yield model.updateSingleBookingRoom({ status: "checked_in", checked_in_at: new Date().toISOString() }, { booking_id, room_id: Number(req.params.room_id) });
            // check all booking rooms are check in or not
            const getSingleBookingRoom = yield model.getSingleBooking(hotel_code, booking_id);
            if (getSingleBookingRoom) {
                const { booking_rooms } = getSingleBookingRoom;
                const isAllCheckIn = booking_rooms.every((room) => room.status === "checked_in");
                if (isAllCheckIn) {
                    // update main booking
                    yield model.updateRoomBooking({ status: "checked_in" }, hotel_code, booking_id);
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Successfully Cheked in",
            };
        });
    }
    // public async checkOut(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const hotel_code = req.hotel_admin.hotel_code;
    //     const booking_id = parseInt(req.params.id);
    //     const reservationModel = this.Model.reservationModel(trx);
    //     const sub = new SubReservationService(trx);
    //     const data = await reservationModel.getSingleBooking(
    //       hotel_code,
    //       booking_id
    //     );
    //     if (!data) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //         message: this.ResMsg.HTTP_NOT_FOUND,
    //       };
    //     }
    //     const { status, booking_type, booking_rooms, check_in, check_out } = data;
    //     if (booking_type != "B" && status != "checked_in") {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: "This booking has other status. So, you cannot checkout",
    //       };
    //     }
    //     if (check_out > new Date().toISOString()) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: `You can only check out when the check-out date is or after ${check_out}`,
    //       };
    //     }
    //     const remainCheckOutRooms: BookingRoom[] = booking_rooms?.filter(
    //       (room) => room.status !== "checked_out"
    //     );
    //     if (remainCheckOutRooms?.length) {
    //       await sub.updateRoomAvailabilityService({
    //         reservation_type: "booked_room_decrease",
    //         rooms: remainCheckOutRooms,
    //         hotel_code,
    //       });
    //     }
    //     // update reservation
    //     await reservationModel.updateRoomBooking(
    //       {
    //         status: "checked_out",
    //       },
    //       hotel_code,
    //       booking_id
    //     );
    //     // update booking rooms status
    //     await reservationModel.updateAllBookingRoomsByBookingID(
    //       { status: "checked_out", checked_out_at: new Date().toISOString() },
    //       { booking_id }
    //     );
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_OK,
    //       message: "Successfully Checked out",
    //     };
    //   });
    // }
    // modified for all check out for 1 night
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
                const totalNights = lib_1.default.calculateNights(check_in, check_out);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkOutDate = new Date(check_out);
                checkOutDate.setHours(0, 0, 0, 0);
                const dayBeforeCheckout = new Date(checkOutDate);
                dayBeforeCheckout.setDate(dayBeforeCheckout.getDate() - 1);
                if (totalNights > 1) {
                    if (new Date(check_out) > new Date()) {
                        console.log("first");
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `You can only check out on or after ${check_out}`,
                        };
                    }
                }
                else {
                    // logic for same day checkin checkout if 1 night stay, can checkout on check-out date or previous day
                    if (totalNights == 1 &&
                        checkOutDate.getTime() !== today.getTime() &&
                        dayBeforeCheckout.getTime() !== today.getTime()) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `You can only check out on or after ${check_out}`,
                        };
                    }
                }
                // if booking room check_in and check_out are different from main booking check_in and check_out
                // then cannot checkout all rooms together
                booking_rooms === null || booking_rooms === void 0 ? void 0 : booking_rooms.forEach((room) => {
                    console.log(room.check_in, room.check_out, "room");
                    if ((check_in != room.check_in && check_out != room.check_out) ||
                        (room.check_in == check_in && check_out != room.check_out) ||
                        (check_in != room.check_in && room.check_out == check_out)) {
                        throw new customEror_1.default(`Because each room has a different check-in and check-out date, you are unable to check out every room. Please check out each room separately.`, this.StatusCode.HTTP_BAD_REQUEST);
                    }
                });
                const remainCheckOutRooms = booking_rooms === null || booking_rooms === void 0 ? void 0 : booking_rooms.filter((room) => room.status !== "checked_out");
                if (remainCheckOutRooms === null || remainCheckOutRooms === void 0 ? void 0 : remainCheckOutRooms.length) {
                    yield sub.updateRoomAvailabilityService({
                        reservation_type: "booked_room_decrease",
                        rooms: remainCheckOutRooms,
                        hotel_code,
                    });
                }
                // update reservation
                yield reservationModel.updateRoomBooking({
                    status: "checked_out",
                }, hotel_code, booking_id);
                // update booking rooms status
                yield reservationModel.updateAllBookingRoomsByBookingID({ status: "checked_out", checked_out_at: new Date().toISOString() }, { booking_id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully Checked out",
                };
            }));
        });
    }
    // public async individualRoomCheckOut(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const hotel_code = req.hotel_admin.hotel_code;
    //     const booking_id = parseInt(req.params.id);
    //     const roomID = parseInt(req.params.room_id);
    //     const reservationModel = this.Model.reservationModel(trx);
    //     const sub = new SubReservationService(trx);
    //     const data = await reservationModel.getSingleBooking(
    //       hotel_code,
    //       booking_id
    //     );
    //     if (!data) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //         message: this.ResMsg.HTTP_NOT_FOUND,
    //       };
    //     }
    //     const { status, booking_type, booking_rooms } = data;
    //     if (booking_type != "B" && status != "checked_in") {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: "This booking has other status. So, you cannot checkout",
    //       };
    //     }
    //     const singleRoom = await reservationModel.getSingleBookingRoom({
    //       booking_id,
    //       room_id: roomID,
    //     });
    //     if (!singleRoom) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //         message: this.ResMsg.HTTP_NOT_FOUND,
    //       };
    //     }
    //     const { check_out } = singleRoom;
    //     if (check_out > new Date().toISOString()) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: `You can only check out when the check-out date is or after ${check_out}`,
    //       };
    //     }
    //     const checkoutRoom = booking_rooms.find((room) => room.room_id == roomID);
    //     if (!checkoutRoom) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: "Room not found by this booking ID",
    //       };
    //     }
    //     // room avaibility decrease
    //     await sub.updateRoomAvailabilityService({
    //       reservation_type: "booked_room_decrease",
    //       rooms: [checkoutRoom],
    //       hotel_code,
    //     });
    //     // update booking rooms status
    //     await reservationModel.updateSingleBookingRoom(
    //       { status: "checked_out", checked_out_at: new Date().toISOString() },
    //       { booking_id, room_id: checkoutRoom.room_id }
    //     );
    //     // check all booking rooms are check in or not
    //     const getSingleBookingRoom = await reservationModel.getSingleBooking(
    //       hotel_code,
    //       booking_id
    //     );
    //     if (getSingleBookingRoom) {
    //       const { booking_rooms } = getSingleBookingRoom;
    //       const isAllCheckout = booking_rooms.every(
    //         (room) => room.status === "checked_out"
    //       );
    //       if (isAllCheckout) {
    //         // update main booking
    //         await reservationModel.updateRoomBooking(
    //           { status: "checked_out" },
    //           hotel_code,
    //           booking_id
    //         );
    //       }
    //     }
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_OK,
    //       message: "Successfully Cheked out",
    //     };
    //   });
    // }
    // v2
    individualRoomCheckOut(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = req.hotel_admin.hotel_code;
                const booking_id = parseInt(req.params.id);
                const roomID = parseInt(req.params.room_id);
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
                const { status, booking_type, booking_rooms } = data;
                if (booking_type != "B" && status != "checked_in") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "This booking has other status. So, you cannot checkout",
                    };
                }
                const singleRoom = yield reservationModel.getSingleBookingRoom({
                    booking_id,
                    room_id: roomID,
                });
                if (!singleRoom) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { check_out } = singleRoom;
                const totalNights = lib_1.default.calculateNights(singleRoom.check_in, singleRoom.check_out);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkOutDate = new Date(check_out);
                checkOutDate.setHours(0, 0, 0, 0);
                const dayBeforeCheckout = new Date(checkOutDate);
                dayBeforeCheckout.setDate(dayBeforeCheckout.getDate() - 1);
                // here below is the logic for if 1 night stay, can checkout on check-out date or previous day by today date
                if (totalNights == 1) {
                    if (checkOutDate.getTime() !== today.getTime() &&
                        dayBeforeCheckout.getTime() !== today.getTime()) {
                        console.log("here");
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `You can only check out on or after ${check_out}`,
                        };
                    }
                }
                if (totalNights > 1) {
                    if (new Date(check_out) > new Date()) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `You can only check out on or after ${check_out}`,
                        };
                    }
                }
                const checkoutRoom = booking_rooms.find((room) => room.room_id == roomID);
                if (!checkoutRoom) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Room not found by this booking ID",
                    };
                }
                // room avaibility decrease
                yield sub.updateRoomAvailabilityService({
                    reservation_type: "booked_room_decrease",
                    rooms: [checkoutRoom],
                    hotel_code,
                });
                // update booking rooms status
                yield reservationModel.updateSingleBookingRoom({ status: "checked_out", checked_out_at: new Date().toISOString() }, { booking_id, room_id: checkoutRoom.room_id });
                // check all booking rooms are check in or not
                const getSingleBookingRoom = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (getSingleBookingRoom) {
                    const { booking_rooms } = getSingleBookingRoom;
                    const isAllCheckout = booking_rooms.every((room) => room.status === "checked_out");
                    if (isAllCheckout) {
                        // update main booking
                        yield reservationModel.updateRoomBooking({ status: "checked_out" }, hotel_code, booking_id);
                    }
                }
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
                    yield sub.updateRoomAvailabilityService({
                        reservation_type: "hold_decrease",
                        rooms: booking_rooms,
                        hotel_code,
                    });
                    yield sub.updateRoomAvailabilityService({
                        reservation_type: "booked_room_increase",
                        rooms: booking_rooms,
                        hotel_code,
                    });
                    // update room availability
                }
                else if (reservation_type_status == "canceled") {
                    // update
                    yield this.Model.reservationModel().updateRoomBooking({
                        booking_type: "H",
                        status: "canceled",
                    }, hotel_code, booking_id);
                    // Availability
                    yield sub.updateRoomAvailabilityService({
                        reservation_type: "hold_decrease",
                        rooms: booking_rooms,
                        hotel_code,
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully updated",
                };
            }));
        });
    }
}
exports.ReservationService = ReservationService;
exports.default = ReservationService;
//# sourceMappingURL=reservation.service.js.map