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
class SupplierService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { name, phone, last_balance } = req.body;
                yield this.Model.supplierModel(trx).createSupplier({
                    hotel_code,
                    name,
                    phone,
                    last_balance,
                    created_by: admin_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Supplier created successfully.",
                };
            }));
        });
    }
    getAllSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, name, status } = req.query;
            const { data, total } = yield this.Model.supplierModel().getAllSupplier({
                key: name,
                status: status,
                limit: limit,
                skip: skip,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getAllSupplierPaymentById(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const { data, total } = yield this.Model.supplierModel().getAllSupplierPaymentById({
                key: key,
                from_date: from_date,
                to_date: to_date,
                limit: limit,
                skip: skip,
                hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getAllSupplierInvoiceById(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, from_date, to_date } = req.query;
            const { data, total } = yield this.Model.supplierModel().getAllSupplierInvoiceBySupId({
                key: key,
                from_date: from_date,
                to_date: to_date,
                limit: limit,
                skip: skip,
                hotel_code,
                sup_id: parseInt(req.params.id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    updateSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.supplierModel(trx);
                const { data } = yield model.getAllSupplier({
                    id: parseInt(id),
                    hotel_code,
                });
                if (!data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Supplier not found with this ID",
                    };
                }
                yield model.updateSupplier(parseInt(id), hotel_code, updatePayload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Supplier updated successfully",
                };
            }));
        });
    }
    deleteSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { id } = req.params;
                yield this.Model.supplierModel(trx).updateSupplier(parseInt(id), hotel_code, {
                    is_deleted: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Supplier deleted successfully",
                };
            }));
        });
    }
    supplierPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { acc_id, supplier_id, paid_amount, receipt_type, inv_id, remarks, payment_date, } = req.body;
                //   checking user
                const model = this.Model.supplierModel(trx);
                const pInvModel = this.Model.purchaseInventoryModel(trx);
                const [singleSupplier] = yield model.getSingleSupplier(supplier_id, hotel_code);
                if (!singleSupplier) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Supplier not found with this ID",
                    };
                }
                // get supplier last balance
                const lastBalance = yield model.getSupplierLastBalance({
                    supplier_id,
                    hotel_code,
                });
                // const check account
                const accountModel = this.Model.accountModel(trx);
                const checkAccount = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: acc_id,
                });
                if (!checkAccount.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                const { acc_type } = checkAccount[0];
                // check invoice
                if (receipt_type === "invoice") {
                    const checkPurchase = yield pInvModel.getSinglePurchase(inv_id, hotel_code);
                    if (!checkPurchase) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invoice not found with this user",
                        };
                    }
                    const { due, grand_total, voucher_no } = checkPurchase;
                    if (due == 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Already paid this invoice",
                        };
                    }
                    const remainingBalance = due - paid_amount;
                    yield pInvModel.updatePurchase({
                        due: remainingBalance,
                    }, { id: inv_id });
                    // insert supplier payment
                    yield model.insertSupplierPayment({
                        created_by: admin_id,
                        hotel_code: hotel_code,
                        debit: paid_amount,
                        credit: 0,
                        acc_id,
                        supplier_id,
                        purchase_id: inv_id,
                        voucher_no,
                        payment_date,
                    });
                }
                else {
                    // overall payment step
                    const { data: allInvoiceByUser } = yield model.getAllSupplierInvoiceBySupId({
                        hotel_code,
                        sup_id: supplier_id,
                        due: true,
                    });
                    const unpaidInvoice = [];
                    for (let i = 0; i < (allInvoiceByUser === null || allInvoiceByUser === void 0 ? void 0 : allInvoiceByUser.length); i++) {
                        if (Number(allInvoiceByUser[i].due) !== 0) {
                            unpaidInvoice.push({
                                invoice_id: allInvoiceByUser[i].id,
                                grand_total: allInvoiceByUser[i].grand_total,
                                due: allInvoiceByUser[i].due,
                            });
                        }
                    }
                    if (!unpaidInvoice.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No due invoice found",
                        };
                    }
                    // total due amount
                    let remainingPaidAmount = paid_amount;
                    const paidingInvoice = [];
                    for (let i = 0; i < unpaidInvoice.length; i++) {
                        if (remainingPaidAmount > 0) {
                            if (paid_amount >= unpaidInvoice[i].due) {
                                remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
                                paidingInvoice.push({
                                    invoice_id: unpaidInvoice[i].invoice_id,
                                    due: unpaidInvoice[i].due - unpaidInvoice[i].due,
                                });
                            }
                            else {
                                remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
                                paidingInvoice.push({
                                    invoice_id: unpaidInvoice[i].invoice_id,
                                    due: unpaidInvoice[i].due - paid_amount,
                                });
                            }
                        }
                    }
                    // =============== update invoice ==============//
                    Promise.all(paidingInvoice.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield pInvModel.updatePurchase({ due: item.due }, { id: item.invoice_id });
                    })));
                    // insert supplier payment
                    yield model.insertSupplierPayment({
                        created_by: admin_id,
                        hotel_code: hotel_code,
                        debit: paid_amount,
                        credit: 0,
                        acc_id,
                        supplier_id,
                        purchase_id: inv_id,
                        voucher_no: "sdfhkj",
                        payment_date,
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getAllSupplierPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, from_date, to_date, limit, skip } = req.query;
            const { data, total } = yield this.Model.supplierModel().getAllSupplierPayment({
                key: key,
                from_date: from_date,
                to_date: to_date,
                limit: limit,
                skip: skip,
                hotel_code: req.hotel_admin.hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
}
exports.default = SupplierService;
//# sourceMappingURL=supplier.service.js.map