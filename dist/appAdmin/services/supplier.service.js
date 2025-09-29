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
const helperFunction_1 = require("../utlis/library/helperFunction");
const helperLib_1 = __importDefault(require("../utlis/library/helperLib"));
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
    // public async supplierPayment(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const { hotel_code, id: admin_id } = req.hotel_admin;
    //     const {
    //       acc_id,
    //       supplier_id,
    //       paid_amount,
    //       receipt_type,
    //       inv_id,
    //       remarks,
    //       payment_date,
    //     } = req.body as IsupplierPaymentReqBody;
    //     const supplierModel = this.Model.supplierModel(trx);
    //     const pInvModel = this.Model.purchaseInventoryModel(trx);
    //     const [singleSupplier] = await supplierModel.getSingleSupplier(
    //       supplier_id,
    //       hotel_code
    //     );
    //     if (!singleSupplier) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //         message: "Supplier not found with this ID",
    //       };
    //     }
    //     // const check account
    //     const accountModel = this.Model.accountModel(trx);
    //     const checkAccount = await accountModel.getSingleAccount({
    //       hotel_code,
    //       id: acc_id,
    //     });
    //     if (!checkAccount.length) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //         message: "Account not found",
    //       };
    //     }
    //     const { acc_type } = checkAccount[0];
    //     // check invoice
    //     if (receipt_type === "invoice") {
    //       const checkPurchase = await pInvModel.getSinglePurchase(
    //         inv_id as number,
    //         hotel_code
    //       );
    //       if (!checkPurchase) {
    //         return {
    //           success: false,
    //           code: this.StatusCode.HTTP_NOT_FOUND,
    //           message: "Invoice not found with this user",
    //         };
    //       }
    //       const { due, grand_total, purchase_no } = checkPurchase;
    //       if (due == 0) {
    //         return {
    //           success: false,
    //           code: this.StatusCode.HTTP_BAD_REQUEST,
    //           message: "Already paid this invoice",
    //         };
    //       }
    //       const remainingBalance = due - paid_amount;
    //       await pInvModel.updatePurchase(
    //         {
    //           due: remainingBalance,
    //         },
    //         { id: inv_id as number }
    //       );
    //       const helper = new HelperFunction();
    //       const hotelModel = this.Model.HotelModel(trx);
    //       const heads = await hotelModel.getHotelAccConfig(hotel_code, [
    //         "ACCOUNT_PAYABLE_HEAD_ID",
    //       ]);
    //       const payable_head = heads.find(
    //         (h) => h.config === "ACCOUNT_PAYABLE_HEAD_ID"
    //       );
    //       if (!payable_head) {
    //         throw new Error(
    //           "ACCOUNT_PAYABLE_HEAD_ID not configured for this hotel"
    //         );
    //       }
    //       const accountModel = this.Model.accountModel(trx);
    //       const voucher_no1 = await helper.generateVoucherNo("JV", trx);
    //       const created_by = req.hotel_admin.id;
    //       const today = new Date().toISOString();
    //       await accountModel.insertAccVoucher([
    //         {
    //           acc_head_id: payable_head.head_id,
    //           created_by,
    //           debit: paid_amount,
    //           credit: 0,
    //           description: `Payable decreasing for payment ${purchase_no}`,
    //           voucher_date: today,
    //           voucher_no: voucher_no1,
    //           hotel_code,
    //         },
    //       ]);
    //       if (paid_amount > 0) {
    //         const [acc] = await accountModel.getSingleAccount({
    //           hotel_code,
    //           id: acc_id,
    //         });
    //         if (!acc) throw new Error("Invalid Account");
    //         let voucher_type: "CCV" | "BCV" = "CCV";
    //         if (acc.acc_type === "BANK") {
    //           voucher_type = "BCV";
    //         }
    //         const voucher_no = await helper.generateVoucherNo(voucher_type, trx);
    //         await accountModel.insertAccVoucher([
    //           {
    //             acc_head_id: acc.acc_head_id,
    //             created_by,
    //             debit: 0,
    //             credit: paid_amount,
    //             description: `Payment given for due balance of purchase ${purchase_no}`,
    //             voucher_date: today,
    //             voucher_no,
    //             hotel_code,
    //           },
    //         ]);
    //         // insert supplier payment
    //         const [supplierPaymentID] = await supplierModel.insertSupplierPayment(
    //           {
    //             created_by: admin_id,
    //             hotel_code: hotel_code,
    //             debit: paid_amount,
    //             credit: 0,
    //             acc_id,
    //             supplier_id,
    //             purchase_id: inv_id as number,
    //             voucher_no,
    //             payment_date: new Date().toISOString(),
    //           }
    //         );
    //       }
    //     } else {
    //       // overall payment step
    //       const { data: allInvoiceByUser } =
    //         await supplierModel.getAllSupplierInvoiceBySupId({
    //           hotel_code,
    //           sup_id: supplier_id,
    //           due: true,
    //         });
    //       const unpaidInvoice: {
    //         invoice_id: number;
    //         grand_total: number;
    //         due: number;
    //       }[] = [];
    //       for (let i = 0; i < allInvoiceByUser?.length; i++) {
    //         if (Number(allInvoiceByUser[i].due) !== 0) {
    //           unpaidInvoice.push({
    //             invoice_id: allInvoiceByUser[i].id,
    //             grand_total: allInvoiceByUser[i].grand_total,
    //             due: allInvoiceByUser[i].due,
    //           });
    //         }
    //       }
    //       if (!unpaidInvoice.length) {
    //         return {
    //           success: false,
    //           code: this.StatusCode.HTTP_NOT_FOUND,
    //           message: "No due invoice found",
    //         };
    //       }
    //       // total due amount
    //       let remainingPaidAmount = paid_amount;
    //       const paidingInvoice: {
    //         invoice_id: number;
    //         due: number;
    //       }[] = [];
    //       for (let i = 0; i < unpaidInvoice.length; i++) {
    //         if (remainingPaidAmount > 0) {
    //           if (paid_amount >= unpaidInvoice[i].due) {
    //             remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
    //             paidingInvoice.push({
    //               invoice_id: unpaidInvoice[i].invoice_id,
    //               due: unpaidInvoice[i].due - unpaidInvoice[i].due,
    //             });
    //           } else {
    //             remainingPaidAmount = paid_amount - unpaidInvoice[i].due;
    //             paidingInvoice.push({
    //               invoice_id: unpaidInvoice[i].invoice_id,
    //               due: unpaidInvoice[i].due - paid_amount,
    //             });
    //           }
    //         }
    //       }
    //       // =============== update invoice ==============//
    //       Promise.all(
    //         paidingInvoice.map(async (item) => {
    //           await pInvModel.updatePurchase(
    //             { due: item.due },
    //             { id: item.invoice_id }
    //           );
    //         })
    //       );
    //       //___________________ ACCOUNTING PART ___________________//
    //       const helper = new HelperFunction();
    //       const hotelModel = this.Model.HotelModel(trx);
    //       const heads = await hotelModel.getHotelAccConfig(hotel_code, [
    //         "ACCOUNT_PAYABLE_HEAD_ID",
    //       ]);
    //       const payable_head = heads.find(
    //         (h) => h.config === "ACCOUNT_PAYABLE_HEAD_ID"
    //       );
    //       if (!payable_head) {
    //         throw new Error(
    //           "ACCOUNT_PAYABLE_HEAD_ID not configured for this hotel"
    //         );
    //       }
    //       const accountModel = this.Model.accountModel(trx);
    //       const voucher_no1 = await helper.generateVoucherNo("JV", trx);
    //       const created_by = req.hotel_admin.id;
    //       const today = new Date().toISOString();
    //       await accountModel.insertAccVoucher([
    //         {
    //           acc_head_id: payable_head.head_id,
    //           created_by,
    //           debit: paid_amount,
    //           credit: 0,
    //           description: `Payable decreasing for payment`,
    //           voucher_date: today,
    //           voucher_no: voucher_no1,
    //           hotel_code,
    //         },
    //       ]);
    //       if (paid_amount > 0) {
    //         const [acc] = await accountModel.getSingleAccount({
    //           hotel_code,
    //           id: acc_id,
    //         });
    //         if (!acc) throw new Error("Invalid Account");
    //         let voucher_type: "CCV" | "BCV" = "CCV";
    //         if (acc.acc_type === "BANK") {
    //           voucher_type = "BCV";
    //         }
    //         const voucher_no = await helper.generateVoucherNo(voucher_type, trx);
    //         await accountModel.insertAccVoucher([
    //           {
    //             acc_head_id: acc.acc_head_id,
    //             created_by,
    //             debit: 0,
    //             credit: paid_amount,
    //             description: `Payment given for due balance of supplier ${singleSupplier.name}`,
    //             voucher_date: today,
    //             voucher_no,
    //             hotel_code,
    //           },
    //         ]);
    //         // insert supplier payment
    //         const [supplierPaymentID] = await supplierModel.insertSupplierPayment(
    //           {
    //             created_by: admin_id,
    //             hotel_code: hotel_code,
    //             debit: paid_amount,
    //             credit: 0,
    //             acc_id,
    //             supplier_id,
    //             voucher_no,
    //             payment_date: new Date().toISOString(),
    //           }
    //         );
    //         const paymentAllocatinPayload = paidingInvoice.map((item) => ({
    //           invoice_id: item.invoice_id,
    //           supplier_payment_id: supplierPaymentID.id,
    //           paid_amount: item.due,
    //         }));
    //         // supplier payment allocation
    //         await supplierModel.insertSupplierPaymentAllocation(
    //           paymentAllocatinPayload
    //         );
    //       }
    //     }
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_SUCCESSFUL,
    //       message: this.ResMsg.HTTP_SUCCESSFUL,
    //     };
    //   });
    // }
    supplierPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { acc_id, supplier_id, paid_amount, receipt_type, inv_id, remarks, payment_date, } = req.body;
                const supplierModel = this.Model.supplierModel(trx);
                const pInvModel = this.Model.purchaseInventoryModel(trx);
                const accountModel = this.Model.accountModel(trx);
                const hotelModel = this.Model.HotelModel(trx);
                const helper = new helperFunction_1.HelperFunction();
                // ---------- validate supplier ----------
                const [singleSupplier] = yield supplierModel.getSingleSupplier(supplier_id, hotel_code);
                if (!singleSupplier) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Supplier not found",
                    };
                }
                // ---------- validate account ----------
                const [account] = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: acc_id,
                });
                if (!account) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                // ---------- get payable head ----------
                const heads = yield hotelModel.getHotelAccConfig(hotel_code, [
                    "ACCOUNT_PAYABLE_HEAD_ID",
                ]);
                const payable_head = heads.find((h) => h.config === "ACCOUNT_PAYABLE_HEAD_ID");
                if (!payable_head)
                    throw new Error("ACCOUNT_PAYABLE_HEAD_ID not configured for this hotel");
                const created_by = admin_id;
                const today = new Date().toISOString();
                // ================= Helper functions =================
                const insertPayableVoucher = (amount, description) => __awaiter(this, void 0, void 0, function* () {
                    const voucher_no = yield helper.generateVoucherNo("JV", trx);
                    yield accountModel.insertAccVoucher([
                        {
                            acc_head_id: payable_head.head_id,
                            created_by,
                            debit: amount,
                            credit: 0,
                            description,
                            voucher_date: today,
                            voucher_no,
                            hotel_code,
                        },
                    ]);
                    return voucher_no;
                });
                const insertPaymentVoucher = (amount, description) => __awaiter(this, void 0, void 0, function* () {
                    let voucher_type = account.acc_type === "BANK" ? "BCV" : "CCV";
                    const voucher_no = yield helper.generateVoucherNo(voucher_type, trx);
                    yield accountModel.insertAccVoucher([
                        {
                            acc_head_id: account.acc_head_id,
                            created_by,
                            debit: 0,
                            credit: amount,
                            description,
                            voucher_date: today,
                            voucher_no,
                            hotel_code,
                        },
                    ]);
                    return voucher_no;
                });
                const trx_no1 = yield new helperLib_1.default(trx).generateSupplierTransactionNo(hotel_code);
                const [st] = yield supplierModel.insertSupplierTransaction({
                    hotel_code,
                    supplier_id,
                    transaction_no: trx_no1,
                    credit: paid_amount,
                    debit: 0,
                    remarks: `For supplier payment. Payment Type ${receipt_type}`,
                });
                const insertSupplierPayment = (amount, supplier_id, acc_id, voucher_no, purchase_id) => __awaiter(this, void 0, void 0, function* () {
                    const [payment] = yield supplierModel.insertSupplierPayment({
                        created_by,
                        hotel_code,
                        debit: amount,
                        credit: 0,
                        acc_id,
                        supplier_id,
                        purchase_id,
                        voucher_no,
                        payment_date: payment_date || today,
                        remarks,
                        trx_id: st.id,
                    });
                    return payment.id;
                });
                // ================== CASE 1: Invoice-wise payment ==================
                if (receipt_type === "invoice") {
                    const checkPurchase = yield pInvModel.getSinglePurchase(inv_id, hotel_code);
                    if (!checkPurchase) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invoice not found",
                        };
                    }
                    const { due, purchase_no } = checkPurchase;
                    if (due <= 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Already paid",
                        };
                    }
                    const remainingBalance = due - paid_amount;
                    yield pInvModel.updatePurchase({ due: remainingBalance }, { id: inv_id });
                    yield insertPayableVoucher(paid_amount, `Payable decreased for invoice ${purchase_no}`);
                    const voucher_no = yield insertPaymentVoucher(paid_amount, `Payment for purchase ${purchase_no}`);
                    yield insertSupplierPayment(paid_amount, supplier_id, acc_id, voucher_no, inv_id);
                }
                // ================== CASE 2: Overall payment ==================
                else {
                    const { data: allInvoice } = yield supplierModel.getAllSupplierInvoiceBySupId({
                        hotel_code,
                        sup_id: supplier_id,
                        due: true,
                    });
                    const unpaidInvoice = allInvoice.filter((inv) => Number(inv.due) > 0);
                    if (!unpaidInvoice.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No due invoice found",
                        };
                    }
                    let remainingPaid = paid_amount;
                    const paidingInvoice = [];
                    for (const inv of unpaidInvoice) {
                        if (remainingPaid <= 0)
                            break;
                        const payAmount = Math.min(inv.due, remainingPaid);
                        remainingPaid -= payAmount;
                        paidingInvoice.push({
                            invoice_id: inv.id,
                            paid_amount: payAmount,
                            new_due: inv.due - payAmount,
                        });
                    }
                    // update invoices
                    for (const item of paidingInvoice) {
                        yield pInvModel.updatePurchase({ due: item.new_due }, { id: item.invoice_id });
                    }
                    yield insertPayableVoucher(paid_amount, `Payable decreased for supplier ${singleSupplier.name}`);
                    const voucher_no = yield insertPaymentVoucher(paid_amount, `Supplier payment to ${singleSupplier.name}`);
                    const supplierPaymentID = yield insertSupplierPayment(paid_amount, supplier_id, acc_id, voucher_no);
                    // payment allocation
                    const allocationPayload = paidingInvoice.map((item) => ({
                        invoice_id: item.invoice_id,
                        supplier_payment_id: supplierPaymentID,
                        paid_amount: item.paid_amount,
                    }));
                    yield supplierModel.insertSupplierPaymentAllocation(allocationPayload);
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