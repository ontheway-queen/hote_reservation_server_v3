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
exports.SurjoPaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
const constants_1 = require("../../utils/miscellaneous/constants");
class SurjoPaymentService extends abstract_service_1.default {
    getSJToken(hotel_code) {
        return __awaiter(this, void 0, void 0, function* () {
            // get surjo pay username, password
            const gateway = yield this.Model.paymentModel().getSinglePaymentGatewayByType({
                hotel_code,
                type: "SURJO_PAY",
            });
            if (!gateway) {
                throw new customEror_1.default("Surjopay gateway Not found", 404);
            }
            const details = gateway.details;
            const { data } = yield axios_1.default.post(constants_1.GET_TOKEN_URL, {
                username: details.username,
                password: details.password,
            });
            return Object.assign(Object.assign({}, data), { gateway });
        });
    }
    //   create payment
    createPayment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(constants_1.PAYMENT_PAY_URL, payload);
            return response.data;
        });
    }
    verifyPayment(order_id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(constants_1.PAYMENT_VERIFY_URL, {
                order_id,
                token,
            });
            return response.data;
        });
    }
}
exports.SurjoPaymentService = SurjoPaymentService;
//# sourceMappingURL=surjoPaymentService.js.map