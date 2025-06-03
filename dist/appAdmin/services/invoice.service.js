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
exports.InvoiceService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const helperFunction_1 = require("../utlis/library/helperFunction");
class InvoiceService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createFolioInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code } = req.hotel_admin;
                const { booking_id, folio_entry_ids, notes } = req.body;
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                const reservationModel = this.Model.reservationModel(trx);
                const entryIDs = [];
                const folioIDs = [];
                folio_entry_ids.forEach((item) => {
                    folioIDs.push(item.folio_id);
                    item.entry_ids.forEach((i) => {
                        entryIDs.push(i);
                    });
                });
                // get folio entries
                const checkFolioEntries = yield reservationModel.getFoliosEntriesbySingleBooking({
                    hotel_code,
                    booking_id,
                    entry_ids: entryIDs,
                });
                if (checkFolioEntries.length !== entryIDs.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid entries",
                    };
                }
                // get folio entries amount
                const folioCalculation = yield reservationModel.getFolioEntriesCalculation(entryIDs);
                const { due_amount, paid_amount, total_amount } = folioCalculation;
                const invoice_no = yield new helperFunction_1.HelperFunction().generateInvoiceNumber();
                // create invoice
                const invRes = yield invoiceModel.insertInInvoice({
                    hotel_code,
                    invoice_date: new Date().toISOString(),
                    invoice_number: invoice_no,
                    total_amount,
                    notes,
                });
                // insert in folio invoice
                const folioInvoicePaylod = folioIDs.map((item) => {
                    return {
                        invoice_id: invRes[0].id,
                        folio_id: item,
                        booking_id,
                    };
                });
                yield invoiceModel.insertFolioInvoice(folioInvoicePaylod);
                // insert in invoice items
                const invoiceItemPayload = [];
                checkFolioEntries.forEach((item) => {
                    invoiceItemPayload.push({
                        invoice_id: invRes[0].id,
                        amount: item.debit ? item.debit : item.credit,
                        type: item.posting_type,
                        folio_id: item.id,
                        description: item.description,
                        folio_entry_id: item.entries_id,
                    });
                });
                yield invoiceModel.insertInFolioInvoiceItems(invoiceItemPayload);
                // updated entries with invoice
                yield reservationModel.updateFolioEntries({ invoiced: true }, entryIDs);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Invoice has been created",
                };
            }));
        });
    }
}
exports.InvoiceService = InvoiceService;
exports.default = InvoiceService;
//# sourceMappingURL=invoice.service.js.map