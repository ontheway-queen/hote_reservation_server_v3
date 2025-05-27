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
class InvoiceService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get All invoice service
    getAllInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, key, limit, skip, due_inovice, user_id } = req.query;
            const { hotel_code } = req.hotel_admin;
            // model
            const model = this.Model.hotelInvoiceModel();
            const { data, total } = yield model.getAllInvoice({
                hotel_code,
                from_date: from_date,
                to_date: to_date,
                key: key,
                limit: limit,
                skip: skip,
                due_inovice: due_inovice,
                user_id: user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get Single invoice service
    getSingleInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { invoice_id } = req.params;
            const model = this.Model.hotelInvoiceModel();
            const singleInvoiceData = yield model.getSingleInvoice({
                hotel_code: req.hotel_admin.hotel_code,
                invoice_id: parseInt(invoice_id),
            });
            if (!singleInvoiceData.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: singleInvoiceData[0],
            };
        });
    }
    // get All invoice for money receipt service
    getAllInvoiceForMoneyReceipt(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_date, to_date, key, limit, skip, due_inovice, user_id } = req.query;
            const { hotel_code } = req.hotel_admin;
            // model
            const model = this.Model.hotelInvoiceModel();
            const data = yield model.getAllInvoiceForMoneyReciept({
                hotel_code,
                from_date: from_date,
                to_date: to_date,
                key: key,
                limit: limit,
                skip: skip,
                due_inovice: due_inovice,
                user_id: user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // create an invoice
    createInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id } = req.hotel_admin;
                const { user_id, discount_amount, tax_amount, invoice_item } = req.body;
                const guestModel = this.Model.guestModel(trx);
                //   checking user
                const checkUser = yield guestModel.getSingleGuest({ id: user_id });
                if (!checkUser.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "User not found",
                    };
                }
                let totalSubAmount = 0;
                if (invoice_item.length) {
                    totalSubAmount = invoice_item.reduce((acc, item) => {
                        const amount = (item.total_price || 0) * item.quantity;
                        return acc + amount;
                    }, 0);
                }
                const grandTotal = totalSubAmount + tax_amount - discount_amount;
                //=================== step for invoice ======================//
                // insert in invoice
                const invoiceModel = this.Model.hotelInvoiceModel(trx);
                // get last invoice
                const invoiceData = yield invoiceModel.getAllInvoiceForLastId();
                const year = new Date().getFullYear();
                const InvoiceNo = invoiceData.length ? invoiceData[0].id + 1 : 1;
                // insert invoice
                const invoiceRes = yield invoiceModel.insertHotelInvoice({
                    invoice_no: `PNL-INV-${year}${InvoiceNo}`,
                    description: `Inovice created by invoice Module, ${`due amount is =${grandTotal}`}`,
                    created_by: id,
                    discount_amount: discount_amount,
                    grand_total: grandTotal,
                    tax_amount: tax_amount,
                    sub_total: totalSubAmount,
                    due: grandTotal,
                    hotel_code,
                    type: "front_desk",
                    user_id,
                });
                // insert invoice item
                const invoiceItem = invoice_item.map((item) => {
                    return {
                        invoice_id: invoiceRes[0],
                        name: item.name,
                        quantity: item.quantity,
                        total_price: item.total_price,
                    };
                });
                yield invoiceModel.insertHotelInvoiceItem(invoiceItem);
                // debit
                yield guestModel.insertGuestLedger({
                    name: `PNL-INV-${year}${InvoiceNo}`,
                    amount: grandTotal,
                    pay_type: "debit",
                    user_id,
                    hotel_code,
                });
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