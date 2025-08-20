"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_CHARGE_TYPE = exports.PAYMENT_TYPE = void 0;
var PAYMENT_TYPE;
(function (PAYMENT_TYPE) {
    PAYMENT_TYPE["MFS"] = "MFS";
    PAYMENT_TYPE["SSL_COMMERCE"] = "SSL_COMMERCE";
    PAYMENT_TYPE["BRAC_BANK"] = "BRAC_BANK";
    PAYMENT_TYPE["PAYPAL"] = "PAYPAL";
    PAYMENT_TYPE["NGENIUS"] = "N_GENIUS";
    PAYMENT_TYPE["MAMO_PAY"] = "MAMO_PAY";
    PAYMENT_TYPE["SURJO_PAY"] = "SURJO_PAY";
})(PAYMENT_TYPE || (exports.PAYMENT_TYPE = PAYMENT_TYPE = {}));
var PAYMENT_CHARGE_TYPE;
(function (PAYMENT_CHARGE_TYPE) {
    PAYMENT_CHARGE_TYPE["FLAT"] = "flat";
    PAYMENT_CHARGE_TYPE["PERCENTAGE"] = "percentage";
})(PAYMENT_CHARGE_TYPE || (exports.PAYMENT_CHARGE_TYPE = PAYMENT_CHARGE_TYPE = {}));
//# sourceMappingURL=payment.gateway.interface.js.map