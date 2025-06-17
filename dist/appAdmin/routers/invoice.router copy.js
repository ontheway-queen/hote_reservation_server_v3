"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstarcts/abstract.router"));
const invoice_controller_1 = __importDefault(require("../controllers/invoice.controller"));
class InvoiceRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.invoiceController = new invoice_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/folio-invoice")
            .post(this.invoiceController.createFolioInvoice)
            .get(this.invoiceController.getAllFolioInvoice);
        this.router
            .route("/folio-invoice/:id")
            .get(this.invoiceController.getSingleFolioInvoice);
        this.router
            .route("/room-invoice/by-booking/:id")
            .get(this.invoiceController.getSingleBookingRoomsInvoice);
    }
}
exports.default = InvoiceRouter;
//# sourceMappingURL=invoice.router%20copy.js.map