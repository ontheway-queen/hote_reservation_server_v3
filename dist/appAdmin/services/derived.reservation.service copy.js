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
exports.ReservationService3 = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const helperFunction_1 = require("../utlis/library/helperFunction");
const subreservation_service_1 = require("./subreservation.service");
class ReservationService3 extends abstract_service_1.default {
    constructor() {
        super();
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
                    booking_id: Number(checkSingleFolio.booking_id),
                    room_id: checkSingleFolio === null || checkSingleFolio === void 0 ? void 0 : checkSingleFolio.room_id,
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
                    booking_id: Number(checkSingleFolio.booking_id),
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
                // check booking
                const booking = yield this.Model.reservationModel(trx).getSingleBooking(req.hotel_admin.hotel_code, Number(checkSingleFolio.booking_id));
                yield this.Model.hotelInvoiceModel().insertInFolioEntries({
                    debit: -amount,
                    credit: 0,
                    folio_id: folio_id,
                    posting_type: "Adjustment",
                    description: remarks,
                });
                const hotelModel = this.Model.HotelModel(trx);
                const heads = yield hotelModel.getHotelAccConfig(req.hotel_admin.hotel_code, ["RECEIVABLE_HEAD_ID", "HOTEL_REVENUE_HEAD_ID"]);
                const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
                if (!receivable_head) {
                    throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
                }
                const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
                if (!sales_head) {
                    throw new Error("HOTEL_REVENUE_HEAD_ID not configured for this hotel");
                }
                const today = new Date().toISOString().split("T")[0];
                if (booking === null || booking === void 0 ? void 0 : booking.voucher_no)
                    yield this.Model.accountModel(trx).insertAccVoucher([
                        {
                            acc_head_id: receivable_head.head_id,
                            created_by: req.hotel_admin.id,
                            debit: 0,
                            credit: amount,
                            description: `Receivable for Adjusted amount, Booking Ref ${checkSingleFolio.booking_ref}`,
                            voucher_date: today,
                            voucher_no: booking === null || booking === void 0 ? void 0 : booking.voucher_no,
                            hotel_code: req.hotel_admin.hotel_code,
                        },
                        {
                            acc_head_id: sales_head.head_id,
                            created_by: req.hotel_admin.id,
                            debit: amount,
                            credit: 0,
                            description: `Sales for Adjusted amount, Booking ref ${checkSingleFolio.booking_ref}`,
                            voucher_date: today,
                            voucher_no: booking === null || booking === void 0 ? void 0 : booking.voucher_no,
                            hotel_code: req.hotel_admin.hotel_code,
                        },
                    ]);
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
                yield this.Model.hotelInvoiceModel(trx).insertInFolioEntries({
                    debit: amount,
                    folio_id: folio_id,
                    posting_type: "CHARGE",
                    description: remarks,
                });
                // insert entries
                const helper = new helperFunction_1.HelperFunction();
                const hotelModel = this.Model.HotelModel(trx);
                const heads = yield hotelModel.getHotelAccConfig(req.hotel_admin.hotel_code, ["RECEIVABLE_HEAD_ID", "HOTEL_REVENUE_HEAD_ID"]);
                const receivable_head = heads.find((h) => h.config === "RECEIVABLE_HEAD_ID");
                if (!receivable_head) {
                    throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
                }
                const sales_head = heads.find((h) => h.config === "HOTEL_REVENUE_HEAD_ID");
                if (!sales_head) {
                    throw new Error("RECEIVABLE_HEAD_ID not configured for this hotel");
                }
                // const voucher_no1 = await helper.generateVoucherNo("JV", trx);
                // check booking
                const booking = yield this.Model.reservationModel(trx).getSingleBooking(req.hotel_admin.hotel_code, Number(checkSingleFolio.booking_id));
                const today = new Date().toISOString().split("T")[0];
                if (booking === null || booking === void 0 ? void 0 : booking.voucher_no)
                    yield this.Model.accountModel(trx).insertAccVoucher([
                        {
                            acc_head_id: receivable_head.head_id,
                            created_by: req.hotel_admin.id,
                            debit: amount,
                            credit: 0,
                            description: `Receivable for ADD ITEM in ${checkSingleFolio.booking_ref}`,
                            voucher_date: today,
                            voucher_no: booking.voucher_no,
                            hotel_code: req.hotel_admin.hotel_code,
                        },
                        {
                            acc_head_id: sales_head.head_id,
                            created_by: req.hotel_admin.id,
                            debit: 0,
                            credit: amount,
                            description: `Sales for ADD ITEM in ${checkSingleFolio.booking_ref}`,
                            voucher_date: today,
                            voucher_no: booking.voucher_no,
                            hotel_code: req.hotel_admin.hotel_code,
                        },
                    ]);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.ReservationService3 = ReservationService3;
//# sourceMappingURL=derived.reservation.service%20copy.js.map