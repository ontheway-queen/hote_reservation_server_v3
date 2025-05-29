"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controller_1 = __importDefault(require("../../abstarcts/abstract.controller"));
const invoice_service_1 = __importDefault(require("../services/invoice.service"));
const invoice_validator_1 = __importDefault(require("../utlis/validator/invoice.validator"));
class InvoiceController extends abstract_controller_1.default {
    constructor() {
        super();
        this.invoiceService = new invoice_service_1.default();
        this.invoicevalidator = new invoice_validator_1.default();
    }
}
exports.default = InvoiceController;
//# sourceMappingURL=invoice.controller.js.map