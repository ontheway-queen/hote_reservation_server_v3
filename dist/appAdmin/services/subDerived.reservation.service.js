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
exports.SubDerivedReservationService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const subreservation_service_1 = require("./subreservation.service");
const helperFunction_1 = require("../utlis/library/helperFunction");
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class SubDerivedReservationService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
        this.sub = new subreservation_service_1.SubReservationService(trx);
    }
    changeRoomOfAIndividualReservation({ booking_id, req, body, previouseRoom, booking, nights, new_rooms_rm_type_id, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { new_room_id, previous_room_id, base_rate, changed_rate } = body;
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            let prevRoomAmount = 0;
            let newTotalAmount = 0;
            const primaryFolio = yield invoiceModel.getFoliosbySingleBooking({
                booking_id,
                hotel_code,
                type: "Primary",
            });
            if (!primaryFolio.length) {
                return {
                    success: false,
                    code: 404,
                    message: "Primary folio not found.",
                };
            }
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if ((fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") &&
                    fe.room_id == previous_room_id) {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (!folioEntryIDs.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Previous room folio entries not found",
                };
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            // update single boooking
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [previouseRoom],
                hotel_code,
            });
            if (nights <= 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Invalid check‑in / check‑out dates.",
                };
            }
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.sub.addDays(previouseRoom.check_in, i);
                const tariff = changed_rate;
                const vat = (tariff * booking.vat_percentage) / 100;
                const sc = (tariff * booking.service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: primaryFolio[0].id,
                    date,
                    posting_type: "ROOM_CHARGE",
                    debit: tariff,
                    credit: 0,
                    room_id: new_room_id,
                    description: "Room Tariff",
                    rack_rate: base_rate,
                });
                // VAT
                if (vat > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        description: "VAT",
                        rack_rate: 0,
                        room_id: new_room_id,
                    });
                }
                // Service Charge
                if (sc > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                        room_id: new_room_id,
                    });
                }
            }
            // insert new folio entries
            newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            yield invoiceModel.insertInFolioEntries(folioEntries);
            // update single booking rooms
            yield reservationModel.updateSingleBookingRoom({
                room_id: new_room_id,
                room_type_id: new_rooms_rm_type_id,
                unit_changed_rate: changed_rate,
                unit_base_rate: base_rate,
                changed_rate: changed_rate * nights,
                base_rate: base_rate * nights,
            }, { booking_id, room_id: previous_room_id });
            yield this.sub.updateRoomAvailabilityService({
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
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    changeRoomOfAGroupReservation({ booking_id, req, body, previouseRoom, booking, nights, new_rooms_rm_type_id, checkNewRoom, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { new_room_id, previous_room_id, base_rate, changed_rate } = body;
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            let prevRoomAmount = 0;
            let newTotalAmount = 0;
            // for group
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
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, prevRoomFolio.id);
            // const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if (fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (!folioEntryIDs.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Previous room folio entries not found",
                };
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            // update single boooking
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [previouseRoom],
                hotel_code,
            });
            if (nights <= 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Invalid check‑in / check‑out dates.",
                };
            }
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.sub.addDays(previouseRoom.check_in, i);
                const tariff = changed_rate;
                const vat = (tariff * booking.vat_percentage) / 100;
                const sc = (tariff * booking.service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: prevRoomFolio.id,
                    date,
                    posting_type: "ROOM_CHARGE",
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
                        posting_type: "VAT",
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
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                    });
                }
            }
            // insert new folio entries
            newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
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
            yield this.sub.updateRoomAvailabilityService({
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
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for Change Room Of a reservation. Booking Ref ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    individualRoomDatesChangeOfBookingForIndividual({ req, booking_id, nights, check_in, check_out, booking, bookingRoom, room_id, service_charge_percentage, vat_percentage, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const { check_in: prevCheckIn, check_out: prevCheckOut, unit_base_rate, unit_changed_rate, room_type_id, } = bookingRoom;
            const primaryFolio = yield invoiceModel.getFoliosbySingleBooking({
                hotel_code,
                booking_id,
                type: "Primary",
            });
            console.log({ primaryFolio });
            if (!primaryFolio.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Primary folio not found",
                };
            }
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.sub.addDays(check_in, i);
                const tariff = unit_changed_rate;
                const vat = (tariff * vat_percentage) / 100;
                const sc = (tariff * service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: primaryFolio[0].id,
                    date,
                    posting_type: "ROOM_CHARGE",
                    debit: tariff,
                    credit: 0,
                    room_id,
                    description: "Room Tariff",
                    rack_rate: unit_base_rate,
                });
                // VAT
                if (vat > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "VAT",
                        debit: vat,
                        credit: 0,
                        description: "VAT",
                        rack_rate: 0,
                        room_id,
                    });
                }
                // Service Charge
                if (sc > 0) {
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                        room_id,
                    });
                }
            }
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            let prevRoomAmount = 0;
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if ((fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") &&
                    fe.room_id == room_id) {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (!folioEntryIDs.length) {
                new customEror_1.default("No folio entries found for the specified room.", this.StatusCode.HTTP_NOT_FOUND);
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [bookingRoom],
                hotel_code,
            });
            // insert new folio entries
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            yield invoiceModel.insertInFolioEntries(folioEntries);
            console.log({ room_id, booking_id });
            yield reservationModel.updateSingleBookingRoom({
                check_in,
                check_out,
                changed_rate: unit_changed_rate * nights,
                base_rate: unit_base_rate * nights,
            }, { room_id, booking_id });
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            const receivableEntry = {
                acc_head_id: receivable_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? difference : 0,
                credit: isIncrease ? 0 : difference,
                description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            const salesEntry = {
                acc_head_id: sales_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? 0 : difference,
                credit: isIncrease ? difference : 0,
                description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            // updat room availability
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: [
                    Object.assign(Object.assign({}, bookingRoom), { check_in,
                        check_out }),
                ],
                hotel_code,
            });
        });
    }
    individualRoomDatesChangeOfBookingForGroup({ req, booking_id, nights, check_in, check_out, booking, bookingRoom, room_id, service_charge_percentage, vat_percentage, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const { check_in: prevCheckIn, check_out: prevCheckOut, unit_base_rate, unit_changed_rate, room_type_id, } = bookingRoom;
            const roomFoliosByBooking = yield invoiceModel.getFoliosbySingleBooking({
                booking_id,
                hotel_code,
                type: "room_primary",
            });
            console.log({ roomFoliosByBooking });
            if (!roomFoliosByBooking.length) {
                return {
                    success: false,
                    code: 404,
                    message: "No room-primary folios found.",
                };
            }
            const prevRoomFolio = roomFoliosByBooking.find((rf) => rf.room_id === room_id);
            console.log({ prevRoomFolio });
            if (!prevRoomFolio) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Previous rooms folio not found",
                };
            }
            const folioEntries = [];
            for (let i = 0; i < nights; i++) {
                const date = this.sub.addDays(check_in, i);
                const tariff = unit_changed_rate;
                const vat = (tariff * vat_percentage) / 100;
                const sc = (tariff * service_charge_percentage) / 100;
                // Tariff
                folioEntries.push({
                    folio_id: prevRoomFolio.id,
                    date,
                    posting_type: "ROOM_CHARGE",
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
                        posting_type: "VAT",
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
                        posting_type: "SERVICE_CHARGE",
                        debit: sc,
                        credit: 0,
                        description: "Service Charge",
                        rack_rate: 0,
                    });
                }
            }
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, prevRoomFolio.id);
            console.log({ folioEntriesByFolio });
            // const folioEntryIDs = folioEntriesByFolio.map((fe) => fe.id);
            let prevRoomAmount = 0;
            const folioEntryIDs = folioEntriesByFolio
                .filter((fe) => {
                if (fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            console.log({ room_id, folioEntryIDs, prevRoomAmount });
            if (!folioEntryIDs.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "No folio entries found for the specified room.",
                };
            }
            yield invoiceModel.updateFolioEntries({ is_void: true }, folioEntryIDs);
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_decrease",
                rooms: [bookingRoom],
                hotel_code,
            });
            // insert new folio entries
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            yield invoiceModel.insertInFolioEntries(folioEntries);
            console.log({ check_in, check_out });
            yield reservationModel.updateSingleBookingRoom({
                check_in,
                check_out,
                changed_rate: unit_changed_rate * nights,
                base_rate: unit_base_rate * nights,
            }, { room_id, booking_id });
            //------------------ Accounting ------------------//
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            const receivableEntry = {
                acc_head_id: receivable_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? difference : 0,
                credit: isIncrease ? 0 : difference,
                description: `Receivable for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            const salesEntry = {
                acc_head_id: sales_head.head_id,
                created_by: admin_id,
                debit: isIncrease ? 0 : difference,
                credit: isIncrease ? difference : 0,
                description: `Sales for ${actionText} of single room. Booking ref ${booking.booking_reference}`,
                voucher_date: today,
                voucher_no: booking.voucher_no,
                hotel_code,
            };
            yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            // updat room availability
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: [
                    Object.assign(Object.assign({}, bookingRoom), { check_in,
                        check_out }),
                ],
                hotel_code,
            });
        });
    }
    changeDateOfBookingForIndividual({ booking_rooms, nights, check_in, vat_percentage, service_charge_percentage, check_out, req, booking_id, booking, primaryFolio, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const folioEntries = [];
            for (const room of booking_rooms) {
                for (let i = 0; i < nights; i++) {
                    const date = this.sub.addDays(check_in, i);
                    const tariff = room.unit_changed_rate;
                    const vat = (tariff * vat_percentage) / 100;
                    const sc = (tariff * service_charge_percentage) / 100;
                    folioEntries.push({
                        folio_id: primaryFolio[0].id,
                        date,
                        posting_type: "ROOM_CHARGE",
                        debit: tariff,
                        credit: 0,
                        room_id: room.room_id,
                        description: "Room Tariff",
                        rack_rate: room.unit_base_rate,
                    });
                    if (vat > 0) {
                        folioEntries.push({
                            folio_id: primaryFolio[0].id,
                            date,
                            posting_type: "VAT",
                            debit: vat,
                            credit: 0,
                            room_id: room.room_id,
                            description: "VAT",
                            rack_rate: 0,
                        });
                    }
                    if (sc > 0) {
                        folioEntries.push({
                            folio_id: primaryFolio[0].id,
                            date,
                            posting_type: "SERVICE_CHARGE",
                            debit: sc,
                            credit: 0,
                            room_id: room.room_id,
                            description: "Service Charge",
                            rack_rate: 0,
                        });
                    }
                }
            }
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, primaryFolio[0].id);
            let prevRoomAmount = 0;
            const entryIdsToVoid = folioEntriesByFolio
                .filter((fe) => {
                if ((fe.posting_type == "ROOM_CHARGE" ||
                    fe.posting_type == "VAT" ||
                    fe.posting_type == "SERVICE_CHARGE") &&
                    fe.room_id) {
                    prevRoomAmount += Number(fe.debit);
                    return fe;
                }
            })
                .map((fe) => fe.id);
            if (entryIdsToVoid.length) {
                yield invoiceModel.updateFolioEntries({ is_void: true }, entryIdsToVoid);
            }
            yield invoiceModel.insertInFolioEntries(folioEntries);
            yield this.sub.updateRoomAvailabilityService({
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
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: updateRooms,
                hotel_code,
            });
            //------------------ Accounting ------------------//
            const helper = new helperFunction_1.HelperFunction();
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
    changeDateOfBookingForGroupReservation({ booking_rooms, nights, check_in, vat_percentage, service_charge_percentage, check_out, req, booking_id, booking, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservationModel = this.Model.reservationModel(this.trx);
            const invoiceModel = this.Model.hotelInvoiceModel(this.trx);
            const hotel_code = req.hotel_admin.hotel_code;
            const admin_id = req.hotel_admin.id;
            const folioEntries = [];
            for (const room of booking_rooms) {
                for (let i = 0; i < nights; i++) {
                    const date = this.sub.addDays(check_in, i);
                    const tariff = room.unit_changed_rate;
                    const vat = (tariff * vat_percentage) / 100;
                    const sc = (tariff * service_charge_percentage) / 100;
                    folioEntries.push({
                        folio_id: 0,
                        date,
                        posting_type: "ROOM_CHARGE",
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
                            posting_type: "VAT",
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
                            posting_type: "SERVICE_CHARGE",
                            debit: sc,
                            credit: 0,
                            room_id: room.room_id,
                            description: "Service Charge",
                            rack_rate: 0,
                        });
                    }
                }
            }
            let newTotalAmount = folioEntries.reduce((ac, cu) => { var _a; return ac + Number((_a = cu === null || cu === void 0 ? void 0 : cu.debit) !== null && _a !== void 0 ? _a : 0); }, 0);
            // const folioEntriesByFolio = await invoiceModel.getFolioEntriesbyFolioID(
            //   hotel_code,
            //   primaryFolio[0].id
            // );
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
            let prevRoomAmount = 0;
            // const entryIdsToVoid = folioEntriesByFolio
            //   .filter((fe) => {
            //     if (
            //       (fe.posting_type == "ROOM_CHARGE" ||
            //         fe.posting_type == "VAT" ||
            //         fe.posting_type == "SERVICE_CHARGE") &&
            //       fe.room_id
            //     ) {
            //       prevRoomAmount += Number(fe.debit);
            //       return fe;
            //     }
            //   })
            //   .map((fe) => fe.id);
            for (const f of roomFolios) {
                roomIdToFolioId.set(f.room_id, f.id);
                const folioEntriesByFolio = yield invoiceModel.getFolioEntriesbyFolioID(hotel_code, f.id);
                // entryIdsToVoid.push(...folioEntriesByFolio.map((fe) =>  fe.id));
                entryIdsToVoid.push(...folioEntriesByFolio
                    .filter((fe) => {
                    if (fe.posting_type == "ROOM_CHARGE" ||
                        fe.posting_type == "VAT" ||
                        fe.posting_type == "SERVICE_CHARGE") {
                        prevRoomAmount += Number(fe.debit);
                        return fe;
                    }
                })
                    .map((fe) => fe.id));
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
            yield this.sub.updateRoomAvailabilityService({
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
            yield this.sub.updateRoomAvailabilityService({
                reservation_type: "booked_room_increase",
                rooms: updateRooms,
                hotel_code,
            });
            //------------------ Accounting ------------------//
            const helper = new helperFunction_1.HelperFunction();
            const hotelModel = this.Model.HotelModel(this.trx);
            const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                "RECEIVABLE_HEAD_ID",
                "HOTEL_REVENUE_HEAD_ID",
            ]);
            const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
            if (!receivable_head) {
                throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
            }
            const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
            if (!sales_head) {
                throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
            }
            const accountModel = this.Model.accountModel(this.trx);
            const today = new Date().toISOString().split("T")[0];
            const difference = Math.abs(newTotalAmount - prevRoomAmount);
            const isIncrease = newTotalAmount > prevRoomAmount;
            const actionText = isIncrease
                ? "Increased Reservation Date"
                : "Decreased Reservation Date";
            if (difference !== 0) {
                const receivableEntry = {
                    acc_head_id: receivable_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? difference : 0,
                    credit: isIncrease ? 0 : difference,
                    description: `Receivable for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                const salesEntry = {
                    acc_head_id: sales_head.head_id,
                    created_by: admin_id,
                    debit: isIncrease ? 0 : difference,
                    credit: isIncrease ? difference : 0,
                    description: `Sales for ${actionText} of overall room booking ${booking.booking_reference}`,
                    voucher_date: today,
                    voucher_no: booking.voucher_no,
                    hotel_code,
                };
                yield accountModel.insertAccVoucher([receivableEntry, salesEntry]);
            }
        });
    }
}
exports.SubDerivedReservationService = SubDerivedReservationService;
//# sourceMappingURL=subDerived.reservation.service.js.map