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
const helperFunction_1 = require("../utlis/library/helperFunction");
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
    updateRoomAndRateOfReservation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const booking_id = Number(req.params.id);
                const { hotel_code } = req.hotel_admin;
                const body = req.body;
                const reservationModel = this.Model.reservationModel(trx);
                const hotelInvModel = this.Model.hotelInvoiceModel(trx);
                const roomModel = this.Model.RoomModel(trx);
                const sub = new subreservation_service_1.SubReservationService(trx);
                const booking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { vat_percentage: bookingVatPct = 0, service_charge_percentage: bookingScPct = 0, booking_rooms, guest_id, } = booking;
                if (Array.isArray(body.changed_rate_of_booking_rooms) &&
                    body.changed_rate_of_booking_rooms.length) {
                    for (const change of body.changed_rate_of_booking_rooms) {
                        const room = yield reservationModel.getSingleBookingRoom({
                            booking_id,
                            room_id: change.room_id,
                        });
                        if (!room)
                            continue;
                        const [roomFolio] = yield hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
                            hotel_code,
                            booking_id,
                            room_ids: [room.room_id],
                        });
                        if (!roomFolio)
                            continue;
                        const entryIDs = (_b = (_a = roomFolio.folio_entries) === null || _a === void 0 ? void 0 : _a.map((e) => e.entries_id)) !== null && _b !== void 0 ? _b : [];
                        if (entryIDs.length) {
                            yield hotelInvModel.updateFolioEntries({ is_void: true }, entryIDs);
                        }
                        const nights = sub.calculateNights(room.check_in, room.check_out);
                        yield reservationModel.updateSingleBookingRoom({
                            unit_changed_rate: change.unit_changed_rate,
                            unit_base_rate: change.unit_base_rate,
                            changed_rate: change.unit_changed_rate * nights,
                            base_rate: change.unit_base_rate * nights,
                        }, { room_id: room.room_id, booking_id });
                        const newEntries = [];
                        for (let i = 0; i < nights; i++) {
                            const date = sub.addDays(room.check_in, i);
                            const tariff = change.unit_changed_rate;
                            const vat = (tariff * bookingVatPct) / 100;
                            const sc = (tariff * bookingScPct) / 100;
                            newEntries.push({
                                folio_id: roomFolio.id,
                                description: "Room Tariff",
                                posting_type: "Charge",
                                debit: tariff,
                                credit: 0,
                                date,
                                room_id: room.room_id,
                                rack_rate: room.base_rate,
                            });
                            if (vat > 0) {
                                newEntries.push({
                                    folio_id: roomFolio.id,
                                    description: "VAT",
                                    posting_type: "Charge",
                                    debit: vat,
                                    credit: 0,
                                    date,
                                });
                            }
                            if (sc > 0) {
                                newEntries.push({
                                    folio_id: roomFolio.id,
                                    description: "Service Charge",
                                    posting_type: "Charge",
                                    debit: sc,
                                    credit: 0,
                                    date,
                                });
                            }
                        }
                        if (newEntries.length) {
                            yield hotelInvModel.insertInFolioEntries(newEntries);
                        }
                    }
                }
                if (Array.isArray(body.removed_rooms) && body.removed_rooms.length) {
                    const removedIDs = [...new Set(body.removed_rooms)];
                    const roomsBeingRemoved = booking_rooms.filter((br) => removedIDs.includes(br.room_id));
                    yield reservationModel.deleteBookingRooms(removedIDs);
                    yield sub.updateRoomAvailabilityService({
                        reservation_type: "booked_room_decrease",
                        rooms: roomsBeingRemoved,
                        hotel_code,
                    });
                    const roomFolios = yield hotelInvModel.getFolioWithEntriesbySingleBookingAndRoomID({
                        hotel_code,
                        booking_id,
                        room_ids: removedIDs,
                    });
                    const allEntryIDs = roomFolios.flatMap((f) => { var _a, _b; return (_b = (_a = f === null || f === void 0 ? void 0 : f.folio_entries) === null || _a === void 0 ? void 0 : _a.map((e) => e.entries_id)) !== null && _b !== void 0 ? _b : []; });
                    const allFolioIDs = roomFolios
                        .filter((f) => !(f === null || f === void 0 ? void 0 : f.is_void))
                        .map((f) => f.id);
                    if (allEntryIDs.length) {
                        yield hotelInvModel.updateFolioEntries({ is_void: true }, allEntryIDs);
                    }
                    if (allFolioIDs.length) {
                        yield hotelInvModel.updateSingleFolio({ is_void: true }, { folioIds: allFolioIDs, booking_id, hotel_code });
                    }
                }
                /***********************************************************************
                 * 4. ADD NEW ROOMS
                 **********************************************************************/
                let newlyAddedRooms = [];
                if (Array.isArray(body.add_room_types) && body.add_room_types.length) {
                    yield sub.insertBookingRoomsForGroupBooking({
                        booked_room_types: body.add_room_types,
                        booking_id,
                        hotel_code,
                        is_checked_in: false,
                    });
                    yield sub.updateAvailabilityWhenRoomBooking("booked", body.add_room_types, hotel_code);
                    const { booking_rooms: freshRooms } = (yield reservationModel.getSingleBooking(hotel_code, booking_id));
                    const addedIDs = body.add_room_types.flatMap((rt) => rt.rooms.map((r) => r.room_id));
                    const freshMap = new Map(freshRooms.map((br) => [br.room_id, br]));
                    newlyAddedRooms = addedIDs
                        .map((id) => freshMap.get(id))
                        .filter(Boolean)
                        .map((room) => ({
                        room_id: room.room_id,
                        room_type_id: room.room_type_id,
                        unit_changed_rate: room.unit_changed_rate,
                        unit_base_rate: room.unit_base_rate,
                        check_in: room.check_in,
                        check_out: room.check_out,
                    }));
                }
                for (const br of newlyAddedRooms) {
                    const [roomRow] = yield roomModel.getSingleRoom(hotel_code, br.room_id);
                    const roomName = (_c = roomRow === null || roomRow === void 0 ? void 0 : roomRow.room_name) !== null && _c !== void 0 ? _c : br.room_id.toString();
                    const [lastFolio] = yield hotelInvModel.getLasFolioId();
                    const folio_number = helperFunction_1.HelperFunction.generateFolioNumber(lastFolio === null || lastFolio === void 0 ? void 0 : lastFolio.id);
                    const [roomFolio] = yield hotelInvModel.insertInFolio({
                        hotel_code,
                        booking_id,
                        room_id: br.room_id,
                        type: "room_primary",
                        guest_id,
                        folio_number,
                        status: "open",
                        name: `Room ${roomName} Folio`,
                    });
                    const nights = sub.calculateNights(br.check_in, br.check_out);
                    const entries = [];
                    for (let i = 0; i < nights; i++) {
                        const date = sub.addDays(br.check_in, i);
                        const tariff = br.unit_changed_rate;
                        const vat = (tariff * bookingVatPct) / 100;
                        const sc = (tariff * bookingScPct) / 100;
                        entries.push({
                            folio_id: roomFolio.id,
                            description: "Room Tariff",
                            posting_type: "Charge",
                            debit: tariff,
                            credit: 0,
                            date,
                            room_id: br.room_id,
                        }, {
                            folio_id: roomFolio.id,
                            description: "VAT",
                            posting_type: "Charge",
                            debit: vat,
                            credit: 0,
                            date,
                        }, {
                            folio_id: roomFolio.id,
                            description: "Service Charge",
                            posting_type: "Charge",
                            debit: sc,
                            credit: 0,
                            date,
                        });
                    }
                    yield hotelInvModel.insertInFolioEntries(entries);
                }
                const { total_debit } = yield hotelInvModel.getFolioEntriesCalculationByBookingID({
                    hotel_code,
                    booking_id,
                });
                yield reservationModel.updateRoomBooking({ total_amount: total_debit }, hotel_code, booking_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Group reservation updated",
                };
            }));
        });
    }
    updateSingleReservation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { source_id } = req.body;
                const booking_id = Number(req.params.id);
                const { hotel_code } = req.hotel_admin;
                const reservationModel = this.Model.reservationModel(trx);
                const booking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                if (source_id) {
                    const source = yield this.Model.settingModel().getSingleSource({
                        id: source_id,
                    });
                    if (!source) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Source not found",
                        };
                    }
                }
                yield reservationModel.updateRoomBooking(Object.assign(Object.assign({}, req.body), { source_id }), hotel_code, booking_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Single reservation updated",
                };
            }));
        });
    }
    changeDatesOfBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { hotel_code } = req.hotel_admin;
                const { check_in, check_out } = req.body;
                const reservationModel = this.Model.reservationModel(trx);
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                const sub = new subreservation_service_1.SubReservationService(trx);
                const booking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                const { booking_rooms, check_in: prev_checkin, check_out: prev_checkout, vat_percentage = 0, service_charge_percentage = 0, } = booking;
                if (prev_checkin === check_in && prev_checkout === check_out) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "You have requested the previous date range.",
                    };
                }
                const nights = sub.calculateNights(check_in, check_out);
                if (nights <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid check‑in / check‑out date combination.",
                    };
                }
                const byType = new Map();
                for (const r of booking_rooms) {
                    if (!byType.has(r.room_type_id))
                        byType.set(r.room_type_id, []);
                    byType.get(r.room_type_id).push(r);
                }
                for (const [room_type_id, roomsOfType] of byType) {
                    const availableRoomList = yield reservationModel.getAvailableRoomsByRoomType({
                        hotel_code,
                        check_in,
                        check_out,
                        room_type_id,
                        exclude_booking_id: booking_id,
                    });
                    const idSet = new Set(availableRoomList.map((r) => r.room_id));
                    for (const r of roomsOfType) {
                        if (!idSet.has(r.room_id)) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_CONFLICT,
                                message: `Room ${r.room_name} is not available for the new dates.`,
                            };
                        }
                    }
                }
                const folioEntries = [];
                for (const room of booking_rooms) {
                    for (let i = 0; i < nights; i++) {
                        const date = sub.addDays(check_in, i);
                        const tariff = room.unit_changed_rate;
                        const vat = (tariff * vat_percentage) / 100;
                        const sc = (tariff * service_charge_percentage) / 100;
                        folioEntries.push({
                            folio_id: 0,
                            date,
                            posting_type: "Charge",
                            debit: tariff,
                            credit: 0,
                            room_id: room.room_id,
                            description: "Room Tariff",
                            rack_rate: room.unit_base_rate,
                        });
                        if (vat > 0) {
                            folioEntries.push({
                                folio_id: 0,
                                date,
                                posting_type: "Charge",
                                debit: vat,
                                credit: 0,
                                room_id: room.room_id,
                                description: "VAT",
                                rack_rate: 0,
                            });
                        }
                        if (sc > 0) {
                            folioEntries.push({
                                folio_id: 0,
                                date,
                                posting_type: "Charge",
                                debit: sc,
                                credit: 0,
                                room_id: room.room_id,
                                description: "Service Charge",
                                rack_rate: 0,
                            });
                        }
                    }
                }
                const roomFolios = yield invoiceModel.getFoliosbySingleBooking({
                    booking_id,
                    hotel_code,
                    type: "room_primary",
                });
                if (!roomFolios.length) {
                    return {
                        success: false,
                        code: 404,
                        message: "No room-primary folios found.",
                    };
                }
                const entryIdsToVoid = [];
                const roomIdToFolioId = new Map();
                for (const f of roomFolios) {
                    roomIdToFolioId.set(f.room_id, f.id);
                    const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, f.id);
                    entryIdsToVoid.push(...folioEntriesByFolio.map((fe) => fe.id));
                }
                if (entryIdsToVoid.length) {
                    yield invoiceModel.updateFolioEntries({ is_void: true }, entryIdsToVoid);
                }
                for (const e of folioEntries) {
                    const fid = roomIdToFolioId.get(e.room_id);
                    if (!fid)
                        throw new Error(`No room_primary folio found for room_id ${e.room_id}`);
                    e.folio_id = fid;
                }
                yield invoiceModel.insertInFolioEntries(folioEntries);
                yield sub.updateRoomAvailabilityService({
                    reservation_type: "booked_room_decrease",
                    rooms: booking_rooms,
                    hotel_code,
                });
                const updateRooms = [];
                for (const r of booking_rooms) {
                    updateRooms.push(Object.assign(Object.assign({}, r), { check_in,
                        check_out, changed_rate: r.unit_changed_rate * nights, base_rate: r.unit_base_rate * nights }));
                }
                const roomsUpdate = updateRooms.map((r) => {
                    return reservationModel.updateSingleBookingRoom({
                        check_in,
                        check_out,
                        changed_rate: r.unit_changed_rate * nights,
                        base_rate: r.unit_base_rate * nights,
                    }, { room_id: r.room_id, booking_id });
                });
                yield Promise.all(roomsUpdate);
                //  Block inventory for new range
                yield sub.updateRoomAvailabilityService({
                    reservation_type: "booked_room_increase",
                    rooms: updateRooms,
                    hotel_code,
                });
                const totalAmount = folioEntries.reduce((sum, e) => { var _a; return sum + ((_a = e.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
                yield reservationModel.updateRoomBooking({
                    total_amount: totalAmount,
                    total_nights: nights,
                    check_in,
                    check_out,
                }, hotel_code, booking_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Reservation dates modified successfully.",
                };
            }));
        });
    }
    changeRoomOfAReservation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { hotel_code } = req.hotel_admin;
                const { new_room_id, previous_room_id, base_rate, changed_rate } = req.body;
                const reservationModel = this.Model.reservationModel(trx);
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                const sub = new subreservation_service_1.SubReservationService(trx);
                const booking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                const { booking_rooms } = booking;
                const previouseRoom = booking_rooms.find((room) => room.room_id === previous_room_id);
                console.log({ previouseRoom });
                if (!previouseRoom) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "You have given an invalid room that you want to change",
                    };
                }
                // const get single room
                const checkNewRoom = yield this.Model.RoomModel(trx).getSingleRoom(hotel_code, new_room_id);
                if (!checkNewRoom.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "New Room not found",
                    };
                }
                const { room_type_id: new_rooms_rm_type_id } = checkNewRoom[0];
                const availableRoomList = yield reservationModel.getAllAvailableRoomsByRoomType({
                    hotel_code,
                    check_in: previouseRoom.check_in,
                    check_out: previouseRoom.check_out,
                    room_type_id: new_rooms_rm_type_id,
                    exclude_booking_id: booking_id,
                });
                const isNewRoomAvailable = availableRoomList.find((room) => room.room_id === new_room_id);
                console.log({ isNewRoomAvailable });
                if (!isNewRoomAvailable) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: `Room ${checkNewRoom[0].room_name} is not available for the new dates.`,
                    };
                }
                const roomFolios = yield invoiceModel.getFoliosbySingleBooking({
                    booking_id,
                    hotel_code,
                    type: "room_primary",
                });
                if (!roomFolios.length) {
                    return {
                        success: false,
                        code: 404,
                        message: "No room-primary folios found.",
                    };
                }
                const prevRoomFolio = roomFolios.find((rf) => rf.room_id === previous_room_id);
                if (!prevRoomFolio) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Previous rooms folio not found",
                    };
                }
                console.log({ prevRoomFolio });
                const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, prevRoomFolio.id);
                console.log({ folioEntriesByFolio });
                const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);
                console.log({ previous_room_id, folioEntryIDs });
                if (!folioEntryIDs.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Previous room folio entries not found",
                    };
                }
                yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
                // update single boooking
                yield sub.updateRoomAvailabilityService({
                    reservation_type: "booked_room_decrease",
                    rooms: [previouseRoom],
                    hotel_code,
                });
                const nights = sub.calculateNights(previouseRoom.check_in, previouseRoom.check_out);
                if (nights <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid check‑in / check‑out dates.",
                    };
                }
                const folioEntries = [];
                for (let i = 0; i < nights; i++) {
                    const date = sub.addDays(previouseRoom.check_in, i);
                    const tariff = changed_rate;
                    const vat = (tariff * booking.vat_percentage) / 100;
                    const sc = (tariff * booking.service_charge_percentage) / 100;
                    // Tariff
                    folioEntries.push({
                        folio_id: prevRoomFolio.id,
                        date,
                        posting_type: "Charge",
                        debit: tariff,
                        credit: 0,
                        room_id: new_room_id,
                        description: "Room Tariff",
                        rack_rate: base_rate,
                    });
                    // VAT
                    if (vat > 0) {
                        folioEntries.push({
                            folio_id: prevRoomFolio.id,
                            date,
                            posting_type: "Charge",
                            debit: vat,
                            credit: 0,
                            description: "VAT",
                            rack_rate: 0,
                        });
                    }
                    // Service Charge
                    if (sc > 0) {
                        folioEntries.push({
                            folio_id: prevRoomFolio.id,
                            date,
                            posting_type: "Charge",
                            debit: sc,
                            credit: 0,
                            description: "Service Charge",
                            rack_rate: 0,
                        });
                    }
                }
                yield invoiceModel.insertInFolioEntries(folioEntries);
                // update folio
                yield invoiceModel.updateSingleFolio({
                    room_id: new_room_id,
                    name: `Room ${checkNewRoom[0].room_name} Folio`,
                }, { hotel_code, booking_id, folio_id: prevRoomFolio.id });
                // update single booking rooms
                yield reservationModel.updateSingleBookingRoom({
                    room_id: new_room_id,
                    room_type_id: new_rooms_rm_type_id,
                    unit_changed_rate: changed_rate,
                    unit_base_rate: base_rate,
                    changed_rate: changed_rate * nights,
                    base_rate: base_rate * nights,
                }, { booking_id, room_id: previous_room_id });
                yield sub.updateRoomAvailabilityService({
                    reservation_type: "booked_room_increase",
                    rooms: [
                        {
                            check_in: previouseRoom.check_in,
                            check_out: previouseRoom.check_out,
                            room_type_id: new_rooms_rm_type_id,
                        },
                    ],
                    hotel_code,
                });
                //get folio entries calculation
                const { total_debit } = yield invoiceModel.getFolioEntriesCalculationByBookingID({
                    booking_id,
                    hotel_code,
                });
                yield reservationModel.updateRoomBooking({
                    total_amount: total_debit,
                }, hotel_code, booking_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully Room has been shifted",
                };
            }));
        });
    }
    updateOthersOfARoomByBookingID(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.booking_id);
                const { hotel_code } = req.hotel_admin;
                const reservationModel = this.Model.reservationModel(trx);
                const booking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                // update single booking rooms
                yield reservationModel.updateSingleBookingRoom(req.body, {
                    booking_id,
                    room_id: Number(req.params.room_id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully Updated",
                };
            }));
        });
    }
    individualRoomDatesChangeOfBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { hotel_code } = req.hotel_admin;
                const { check_in, check_out, room_id } = req.body;
                const reservationModel = this.Model.reservationModel(trx);
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                const sub = new subreservation_service_1.SubReservationService(trx);
                const getSingleBooking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!getSingleBooking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                const { vat_percentage, service_charge_percentage } = getSingleBooking;
                const bookingRoom = (yield reservationModel.getSingleBookingRoom({
                    booking_id,
                    room_id,
                }));
                if (!bookingRoom) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Room not found.",
                    };
                }
                const { check_in: prevCheckIn, check_out: prevCheckOut, unit_base_rate, unit_changed_rate, room_type_id, } = bookingRoom;
                if (prevCheckIn === check_in && prevCheckOut === check_out) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "You submitted the same date range.",
                    };
                }
                const nights = sub.calculateNights(check_in, check_out);
                if (nights <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid check‑in / check‑out dates.",
                    };
                }
                // Is the exact room free?
                const roomList = yield reservationModel.getAllAvailableRoomsByRoomType({
                    hotel_code,
                    check_in,
                    check_out,
                    room_type_id,
                    exclude_booking_id: booking_id,
                });
                if (!roomList.some((r) => r.room_id === room_id)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: `Room #${room_id} is not free for the new dates.`,
                    };
                }
                const roomFoliosByBooking = yield invoiceModel.getFoliosbySingleBooking({
                    booking_id,
                    hotel_code,
                    type: "room_primary",
                });
                if (!roomFoliosByBooking.length) {
                    return {
                        success: false,
                        code: 404,
                        message: "No room-primary folios found.",
                    };
                }
                const prevRoomFolio = roomFoliosByBooking.find((rf) => rf.room_id === room_id);
                if (!prevRoomFolio) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Previous rooms folio not found",
                    };
                }
                const folioEntries = [];
                for (let i = 0; i < nights; i++) {
                    const date = sub.addDays(check_in, i);
                    const tariff = unit_changed_rate;
                    const vat = (tariff * vat_percentage) / 100;
                    const sc = (tariff * service_charge_percentage) / 100;
                    // Tariff
                    folioEntries.push({
                        folio_id: prevRoomFolio.id,
                        date,
                        posting_type: "Charge",
                        debit: tariff,
                        credit: 0,
                        room_id,
                        description: "Room Tariff",
                        rack_rate: unit_base_rate,
                    });
                    // VAT
                    if (vat > 0) {
                        folioEntries.push({
                            folio_id: prevRoomFolio.id,
                            date,
                            posting_type: "Charge",
                            debit: vat,
                            credit: 0,
                            description: "VAT",
                            rack_rate: 0,
                        });
                    }
                    // Service Charge
                    if (sc > 0) {
                        folioEntries.push({
                            folio_id: prevRoomFolio.id,
                            date,
                            posting_type: "Charge",
                            debit: sc,
                            credit: 0,
                            description: "Service Charge",
                            rack_rate: 0,
                        });
                    }
                }
                const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, prevRoomFolio.id);
                console.log({ folioEntriesByFolio });
                const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);
                console.log({ room_id, folioEntryIDs });
                if (!folioEntryIDs.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No folio entries found for the specified room.",
                    };
                }
                yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
                yield sub.updateRoomAvailabilityService({
                    reservation_type: "booked_room_decrease",
                    rooms: [bookingRoom],
                    hotel_code,
                });
                yield invoiceModel.insertInFolioEntries(folioEntries);
                yield reservationModel.updateSingleBookingRoom({
                    check_in,
                    check_out,
                    changed_rate: unit_changed_rate * nights,
                    base_rate: unit_base_rate * nights,
                }, { room_id, booking_id });
                yield sub.updateRoomAvailabilityService({
                    reservation_type: "booked_room_increase",
                    rooms: [
                        Object.assign(Object.assign({}, bookingRoom), { check_in,
                            check_out }),
                    ],
                    hotel_code,
                });
                //get folio entries calculation
                const { total_debit } = yield invoiceModel.getFolioEntriesCalculationByBookingID({
                    booking_id,
                    hotel_code,
                });
                yield reservationModel.updateRoomBooking({
                    total_amount: total_debit,
                }, hotel_code, booking_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Room dates updated successfully.",
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
                if (check_out > new Date().toISOString()) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: `You can only check out when the check-out date is or after ${check_out}`,
                    };
                }
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
    individualCheckOut(req) {
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
                const { status, booking_type, booking_rooms, check_in, check_out } = data;
                if (booking_type != "B" && status != "checked_in") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "This booking has other status. So, you cannot checkout",
                    };
                }
                if (check_out > new Date().toISOString()) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: `You can only check out when the check-out date is or after ${check_out}`,
                    };
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
    getFoliosbySingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const invModel = this.Model.hotelInvoiceModel(trx);
                const data = yield invModel.getFoliosbySingleBooking({
                    hotel_code: req.hotel_admin.hotel_code,
                    booking_id: parseInt(req.params.id),
                });
                const { total_credit, total_debit } = yield invModel.getFolioEntriesCalculationByBookingID({
                    hotel_code: req.hotel_admin.hotel_code,
                    booking_id: parseInt(req.params.id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total_credit,
                    total_debit,
                    data,
                };
            }));
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
                    booking_ref: checkSingleFolio.booking_ref,
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
                    booking_ref: checkSingleFolio.booking_ref,
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
    updateOrRemoveGuestFromRoom(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: booking_id, room_id } = req.params;
                const hotel_code = req.hotel_admin.hotel_code;
                const { add_guest, remove_guest } = req.body;
                console.log(req.body);
                const reservationModel = this.Model.reservationModel();
                const guestModel = this.Model.guestModel(trx);
                const booking = yield reservationModel.getSingleBooking(req.hotel_admin.hotel_code, parseInt(booking_id));
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Booking not found",
                    };
                }
                const { booking_rooms } = booking;
                if (add_guest && add_guest.length) {
                    const room = booking_rooms.find((r) => r.room_id === parseInt(room_id));
                    if (!room) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Room not found in this booking",
                        };
                    }
                    const hasPrimaryGuest = room.room_guests.some((g) => g.is_room_primary_guest);
                    if (hasPrimaryGuest && add_guest.some((g) => g.is_room_primary_guest)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "You cannot add more than one primary guest in a room",
                        };
                    }
                    //check multiple guest has primary guest
                    if (add_guest.filter((g) => g.is_room_primary_guest).length > 1) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "You cannot add more than one primary guest in a room",
                        };
                    }
                    yield Promise.all(add_guest.map((guest) => __awaiter(this, void 0, void 0, function* () {
                        const [guestRes] = yield guestModel.createGuestForGroupBooking({
                            first_name: guest.first_name,
                            last_name: guest.last_name,
                            email: guest.email,
                            address: guest.address,
                            country_id: guest.country_id,
                            phone: guest.phone,
                            passport_no: guest.passport_no,
                            hotel_code,
                        });
                        yield this.Model.reservationModel(trx).insertBookingRoomGuest({
                            guest_id: guestRes.id,
                            hotel_code,
                            booking_room_id: room.id,
                            is_room_primary_guest: guest.is_room_primary_guest,
                        });
                    })));
                }
                if (remove_guest && remove_guest.length) {
                    const room = booking_rooms.find((r) => r.room_id === parseInt(room_id));
                    if (!room) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Room not found in this booking",
                        };
                    }
                    const guestsToRemove = room.room_guests.filter((g) => remove_guest.includes(g.guest_id));
                    if (!guestsToRemove.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Guests not found in this room",
                        };
                    }
                    yield this.Model.reservationModel(trx).deleteBookingRoomGuest({
                        booking_room_id: room.id,
                        guest_ids: guestsToRemove.map((g) => g.guest_id),
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Successfully updated room guests",
                };
            }));
        });
    }
}
exports.ReservationService = ReservationService;
exports.default = ReservationService;
//# sourceMappingURL=reservation.service.js.map