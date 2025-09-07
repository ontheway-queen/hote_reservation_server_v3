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
exports.BtocSubPaymentService = void 0;
const uuid_1 = require("uuid");
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const surjoPaymentService_1 = require("./surjoPaymentService");
const constants_1 = require("../../utils/miscellaneous/constants");
class BtocSubPaymentService extends abstract_service_1.default {
    //surjopay sub payment for hotel
    createSurjopayPaymentOrderForHotel({ amount, customer_email, customer_first_name, customer_last_name, customer_phone_number, ip, user_id, is_app, payment_for, hb_sl_id, hotel_code, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const getToken = yield new surjoPaymentService_1.SurjoPaymentService().getSJToken(hotel_code);
            console.log({ getToken });
            if (!getToken) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Token not found",
                };
            }
            const create_payment = yield new surjoPaymentService_1.SurjoPaymentService().createPayment({
                prefix: getToken.gateway.details.prefix,
                token: getToken.token,
                return_url: constants_1.BTOC_PAYMENT_SUCCESS_RETURN_URL + `?queries=${hotel_code}`,
                cancel_url: constants_1.BTOC_PAYMENT_CANCELLED_URL + `?queries=${hotel_code}`,
                store_id: getToken.store_id.toString(),
                amount,
                client_ip: ip,
                currency: "BDT",
                order_id: `BTCP_${(0, uuid_1.v4)()}`,
                customer_name: customer_first_name + " " + customer_last_name,
                customer_email: customer_email,
                customer_phone: customer_phone_number,
                customer_address: "unknown",
                customer_city: "unknown",
                value1: JSON.stringify({
                    payment_for,
                    is_app: is_app ? Boolean(is_app) : false,
                    user_id: user_id.toString(),
                    hb_sl_id,
                    hotel_code,
                }),
            });
            return create_payment;
        });
    }
}
exports.BtocSubPaymentService = BtocSubPaymentService;
//# sourceMappingURL=btoc.subpayment.service.js.map