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
const surjoPaymentService_1 = require("../../btoc/services/surjoPaymentService");
const constants_1 = require("../../utils/miscellaneous/constants");
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const btoc_subHotel_service_1 = require("../../btoc/services/btoc.subHotel.service");
class PaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    btocSurjoPaymentSuccess(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const parseJsonSafe = (raw) => {
                try {
                    return JSON.parse(raw);
                }
                catch (_a) {
                    return null;
                }
            };
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
                console.log(req.query, "query");
                console.log(req.body, "req body");
                const query = (_a = req.query) === null || _a === void 0 ? void 0 : _a.queries;
                const split_queries = query.split("?");
                console.log({ split_queries });
                const hotel_code = split_queries[0];
                console.log(hotel_code);
                const split_order_id = split_queries[1].split("=");
                console.log({ split_order_id });
                const order_id = split_order_id[1];
                console.log(order_id);
                if (!hotel_code) {
                    throw new customEror_1.default("Did not pass hotel code into payment success", 400);
                }
                const surjoService = new surjoPaymentService_1.SurjoPaymentService();
                const token = yield surjoService.getSJToken(Number(hotel_code));
                const verify = yield surjoService.verifyPayment(String(order_id !== null && order_id !== void 0 ? order_id : ""), token.token);
                console.log({ verify });
                const sp_verify = Array.isArray(verify) ? verify[0] : undefined;
                if (!sp_verify) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Unable to verify payment.",
                    };
                }
                const isSuccess = sp_verify.sp_code === "1000";
                const payload = parseJsonSafe(sp_verify.value1);
                console.log({ payload });
                if (!isSuccess) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_OK,
                        message: this.ResMsg.PAYMENT_CANCELLED,
                        redirect_url: lib_1.default.buildURL(`${constants_1.BTOC_CLIENT_DOMAIN}/payment/failed`, {
                            order_id: (_b = req.query.order_id) !== null && _b !== void 0 ? _b : "",
                            payment_for: (_c = payload === null || payload === void 0 ? void 0 : payload.payment_for) !== null && _c !== void 0 ? _c : "",
                            invoice_id: (_d = payload === null || payload === void 0 ? void 0 : payload.invoice_id) !== null && _d !== void 0 ? _d : "",
                            booking_id: (_e = payload === null || payload === void 0 ? void 0 : payload.booking_id) !== null && _e !== void 0 ? _e : "",
                            sp_code: (_f = sp_verify.sp_code) !== null && _f !== void 0 ? _f : "",
                            gross_amount: (_g = sp_verify.amount) !== null && _g !== void 0 ? _g : "",
                            payable_amount: (_h = sp_verify.payable_amount) !== null && _h !== void 0 ? _h : "",
                            customer_order_id: (_j = sp_verify.customer_order_id) !== null && _j !== void 0 ? _j : "",
                            order_id_pg: (_k = sp_verify.order_id) !== null && _k !== void 0 ? _k : "",
                            trx_no: (_l = sp_verify.invoice_no) !== null && _l !== void 0 ? _l : "",
                            payment_time: (_m = sp_verify.date_time) !== null && _m !== void 0 ? _m : "",
                            status: "failed",
                        }),
                    };
                }
                // get single booking
                const singleBooking = yield this.Model.reservationModel().getSingleBooking(Number(hotel_code), payload === null || payload === void 0 ? void 0 : payload.hb_sl_id);
                if (!singleBooking) {
                    throw new customEror_1.default("Reservation not found", 404);
                }
                const sub = new btoc_subHotel_service_1.SubBtocHotelService(trx);
                const hotelInvModel = this.Model.btocInvoiceModel(trx);
                const { booking_rooms, address, booking_date, booking_reference, booking_type, check_in, check_out, comments, country_name, drop, drop_time, drop_to, first_name, guest_email, guest_id, is_individual_booking, last_name, pickup, } = singleBooking;
                const body = sub.mapSingleBookingToFolioBody(singleBooking);
                yield sub.createBtocRoomBookingFolioWithEntries({
                    body,
                    hotel_code: Number(hotel_code),
                    guest_id: singleBooking.guest_id,
                    booking_id: payload === null || payload === void 0 ? void 0 : payload.hb_sl_id,
                    booking_ref: singleBooking.booking_reference,
                    req,
                });
                // const [invoice] = await invModel.singleInvoice({
                //   id: payload.invoice_id,
                // });
                // const invRes = await invModel.insertInInvoice({
                //   hotel_code: Number(hotel_code),
                //   invoice_date: new Date().toUTCString(),
                //   invoice_number: singleBooking.booking_reference,
                //   total_amount: singleBooking.total_amount,
                // });
                // invoice item
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.PAYMENT_SUCCESS,
                    redirect_url: lib_1.default.buildURL(`${constants_1.BTOC_CLIENT_DOMAIN}/payment/success`, {
                        sp_invoice_no: (_o = sp_verify.invoice_no) !== null && _o !== void 0 ? _o : "",
                        gross_amount: (_p = sp_verify.amount) !== null && _p !== void 0 ? _p : "",
                        net_paid_amount: (_q = sp_verify.payable_amount) !== null && _q !== void 0 ? _q : "",
                        net_received_amount: sp_verify.received_amount,
                        // gateway_fee_percentage: SHURJO_PAY_PERCENTAGE,
                        payment_time: (_r = sp_verify.date_time) !== null && _r !== void 0 ? _r : "",
                        customer_order_id: (_s = sp_verify.customer_order_id) !== null && _s !== void 0 ? _s : "",
                        order_id: (_t = sp_verify.order_id) !== null && _t !== void 0 ? _t : "",
                        order_id_query: (_u = req.query.order_id) !== null && _u !== void 0 ? _u : "",
                        user_id: (_v = payload === null || payload === void 0 ? void 0 : payload.user_id) !== null && _v !== void 0 ? _v : "",
                        booking_id: (_w = payload === null || payload === void 0 ? void 0 : payload.booking_id) !== null && _w !== void 0 ? _w : "",
                        hb_sl_id: (_x = payload === null || payload === void 0 ? void 0 : payload.hb_sl_id) !== null && _x !== void 0 ? _x : "",
                        // invoice_id: invoice?.id,
                        // trx_id: transactionRes?.[0]?.id ?? "",
                        status: "success",
                    }),
                };
            }));
        });
    }
    btocSurjoPaymentCancelled(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const getToken = yield new surjoPaymentService_1.SurjoPaymentService().getSJToken(Number(req.query.hotel_code));
            const verify_payment = yield new surjoPaymentService_1.SurjoPaymentService().verifyPayment(req.query.order_id, getToken.token);
            const { value2: is_app } = verify_payment[0];
            // if (parseInt(is_app)) {
            //   return {
            //     success: true,
            //     code: this.StatusCode.HTTP_OK,
            //     message: "Payment has been canceled",
            //   };
            // }
            return {
                success: false,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PAYMENT_CANCELLED,
                redirect_url: `${constants_1.BTOC_CLIENT_DOMAIN}/payment/failed`,
            };
        });
    }
    // payment failed
    btocSurjoPaymentFailed(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            // const tran_id = body.tran_id.split("-");
            // if (tran_id.length !== 3) {
            //   return {
            //     success: true,
            //     code: this.StatusCode.HTTP_OK,
            //     message: "Unverified Transaction",
            //     redirect_url: `${CLIENT_DOMAIN}/failure`,
            //   };
            // }
            // const [paymentTryId, bookingId, user_id] = tran_id;
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Payment Failed",
                redirect_url: `${constants_1.BTOC_CLIENT_DOMAIN}/payment/failed`,
            };
        });
    }
}
exports.default = PaymentService;
//# sourceMappingURL=paymentService.js.map