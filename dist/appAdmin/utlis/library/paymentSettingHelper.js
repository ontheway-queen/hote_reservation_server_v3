"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../../utils/lib/customEror"));
class PaymentSettingHelper extends abstract_service_1.default {
    validateRequiredFields(payload, requiredFields) {
        let details = {};
        if (typeof payload.details === "string") {
            details = JSON.parse(payload.details);
        }
        else {
            details = payload.details;
        }
        const missingFields = requiredFields.filter((field) => !details[field]);
        if (missingFields.length > 0) {
            throw new customEror_1.default(`Missing required fields: ${missingFields.join(", ")}`, 400);
        }
    }
}
exports.default = PaymentSettingHelper;
//# sourceMappingURL=paymentSettingHelper.js.map