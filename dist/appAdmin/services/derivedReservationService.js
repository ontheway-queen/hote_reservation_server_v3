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
exports.DerivedReservationService1 = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const subreservation_service_1 = require("./subreservation.service");
class DerivedReservationService1 extends abstract_service_1.default {
    constructor() {
        super();
    }
    changedRateOfARoomInReservation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { hotel_code, id: admin_id } = req.hotel_admin;
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
                const hotelModel = this.Model.HotelModel(trx);
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
                const accountModel = this.Model.accountModel(trx);
                const today = new Date().toISOString().split("T")[0];
                const { vat_percentage: bookingVatPct = 0, service_charge_percentage: bookingScPct = 0, booking_rooms, guest_id, } = booking;
                if (booking.is_individual_booking) {
                    yield sub.changeRateForRoomInvidiualReservation({
                        body: req.body,
                        booking_id,
                        booking,
                        bookingScPct,
                        bookingVatPct,
                        receivable_head,
                        req,
                        sales_head,
                    });
                }
                else {
                    yield sub.changeRateForRoomInGroupReservation({
                        body: req.body,
                        booking_id,
                        booking,
                        bookingScPct,
                        bookingVatPct,
                        receivable_head,
                        req,
                        sales_head,
                    });
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
    addRoomInReservation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const body = req.body;
                const reservationModel = this.Model.reservationModel(trx);
                const hotelInvModel = this.Model.hotelInvoiceModel(trx);
                const sub = new subreservation_service_1.SubReservationService(trx);
                const booking = yield reservationModel.getSingleBooking(hotel_code, booking_id);
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const hotelModel = this.Model.HotelModel(trx);
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
                const accountModel = this.Model.accountModel(trx);
                const today = new Date().toISOString().split("T")[0];
                const { vat_percentage: bookingVatPct = 0, service_charge_percentage: bookingScPct = 0, booking_rooms, guest_id, } = booking;
                if (booking.is_individual_booking) {
                    yield sub.addRoomInIndividualReservation({
                        body,
                        booking_id,
                        bookingScPct,
                        bookingVatPct,
                        booking,
                        receivable_head,
                        req,
                        sales_head,
                    });
                }
                else {
                    yield sub.addRoomInGroupReservation({
                        body,
                        booking_id,
                        bookingScPct,
                        bookingVatPct,
                        booking,
                        receivable_head,
                        req,
                        sales_head,
                        guest_id,
                    });
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
    deleteRoomInReservation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { hotel_code, id: admin_id } = req.hotel_admin;
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
                const hotelModel = this.Model.HotelModel(trx);
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
                const accountModel = this.Model.accountModel(trx);
                const today = new Date().toISOString().split("T")[0];
                const { vat_percentage: bookingVatPct = 0, service_charge_percentage: bookingScPct = 0, booking_rooms, guest_id, } = booking;
                if (booking.is_individual_booking) {
                    sub.deleteRoomInIndividualReservation({
                        body,
                        booking_id,
                        bookingScPct,
                        bookingVatPct,
                        booking,
                        receivable_head,
                        req,
                        sales_head,
                    });
                }
                else {
                    sub.deleteRoomInGroupReservation({
                        body,
                        booking_id,
                        bookingScPct,
                        bookingVatPct,
                        booking,
                        receivable_head,
                        req,
                        sales_head,
                    });
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
}
exports.DerivedReservationService1 = DerivedReservationService1;
//# sourceMappingURL=derivedReservationService.js.map