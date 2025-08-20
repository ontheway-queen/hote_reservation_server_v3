"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codLogo = exports.mamoPayLiveURL = exports.mamoPaySandboxURL = exports.requiredFieldForMamoPay = exports.requiredFieldForPaypal = exports.requiredFieldForNgenius = exports.requiredFieldForBracBank = void 0;
// Required Field For BRAC BANK
exports.requiredFieldForBracBank = ["secret_key", "merchant_id", "key_id"];
// Required Field For NGenius
exports.requiredFieldForNgenius = ["api_key", "outlet_id", "merchant_id"];
// Required Field For Paypal
exports.requiredFieldForPaypal = ["client_id", "client_secret", "mode"];
exports.requiredFieldForMamoPay = ["api_key", "mode"];
exports.mamoPaySandboxURL = "https://sandbox.dev.business.mamopay.com";
exports.mamoPayLiveURL = "https://business.mamopay.com";
exports.codLogo = "logo/cash-on-delivery-icon-1024x345-7sgjf338.png";
//# sourceMappingURL=paymentGateway.constant.js.map