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
class PurchaseInvService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create purchase
    createPurchase(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { purchase_date, supplier_id, ac_tr_ac_id, discount_amount, vat, shipping_cost, paid_amount, purchase_items, payment_type, } = req.body;
                // Check supplier
                const cmnInvModel = this.Model.CommonInventoryModel(trx);
                // Check account
                const accModel = this.Model.accountModel(trx);
                // Check purchase
                const pInvModel = this.Model.purchaseInventoryModel(trx);
                const pdModel = this.Model.productInventoryModel(trx);
                const checkSupplier = yield cmnInvModel.getSingleSupplier(supplier_id, hotel_code);
                if (!checkSupplier.length) {
                    throw new Error("Invalid Supplier Information");
                }
                const checkAccount = yield accModel.getSingleAccount({
                    hotel_code,
                    id: ac_tr_ac_id,
                });
                if (!checkAccount.length) {
                    throw new Error("Account not found");
                }
                // check purchase item exist or not
                const pdIds = purchase_items.map((item) => item.product_id);
                const { data: checkPd } = yield pdModel.getAllProduct({
                    pd_ids: pdIds,
                    hotel_code,
                });
                if (pdIds.length != checkPd.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Product id is invalid",
                    };
                }
                // const last_balance = checkAccount[0].last_balance;
                const sub_total = purchase_items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
                const grand_total = parseFloat(Number.parseFloat((sub_total +
                    vat +
                    shipping_cost -
                    discount_amount).toString()).toFixed(2));
                const due = grand_total - paid_amount;
                console.log({ checkAccount, grand_total });
                if (paid_amount > grand_total) {
                    throw new Error("Paid Amount cannot be greater than grand total");
                }
                if (discount_amount > grand_total) {
                    throw new Error("Discount amount cannot be greater than grand total");
                }
                // if (last_balance < paid_amount) {
                //   throw new Error("Insufficient balance in this account for payment");
                // }
                const year = new Date().getFullYear();
                // get last voucher ID
                const purchaseData = yield pInvModel.getAllPurchaseForLastId();
                const purchase_no = purchaseData.length
                    ? purchaseData[0].id + 1
                    : 1;
                // Insert purchase
                const createdPurchase = yield pInvModel.createPurchase({
                    hotel_code,
                    purchase_date,
                    supplier_id,
                    discount_amount,
                    sub_total,
                    grand_total,
                    paid_amount,
                    vat,
                    shipping_cost,
                    due,
                    voucher_no: `PUR-${year}${purchase_no}`,
                });
                // product name include in purchase items
                for (let i = 0; i < checkPd.length; i++) {
                    for (let j = 0; j < purchase_items.length; j++) {
                        if (checkPd[i].id == purchase_items[j].product_id) {
                            purchase_items[j].product_name = checkPd[i].name;
                        }
                    }
                }
                // Insert purchase item
                const purchaseItemsPayload = [];
                for (const item of purchase_items) {
                    const existingItem = purchaseItemsPayload.find((p) => p.product_id === item.product_id);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                        existingItem.price += item.price * item.quantity;
                    }
                    else {
                        purchaseItemsPayload.push({
                            product_id: item.product_id,
                            purchase_id: createdPurchase[0].id,
                            price: item.price * item.quantity,
                            quantity: item.quantity,
                            product_name: item.product_name,
                        });
                    }
                }
                yield pInvModel.createPurchaseItem(purchaseItemsPayload);
                // Inventory step
                const modifyInventoryProduct = [];
                const addedInventoryProduct = [];
                const purchase_product_ids = purchase_items.map((item) => item.product_id);
                const getInventoryProduct = yield pInvModel.getAllInventory({
                    hotel_code,
                    product_id: purchase_product_ids,
                });
                for (const payloadItem of purchaseItemsPayload) {
                    const inventoryItem = getInventoryProduct.find((g) => g.product_id === payloadItem.product_id);
                    if (inventoryItem) {
                        modifyInventoryProduct.push({
                            available_quantity: parseFloat(inventoryItem.available_quantity) +
                                payloadItem.quantity,
                            id: inventoryItem.id,
                        });
                    }
                    else {
                        addedInventoryProduct.push({
                            hotel_code,
                            available_quantity: payloadItem.quantity,
                            product_id: payloadItem.product_id,
                        });
                    }
                }
                // Insert in inventory
                if (addedInventoryProduct.length) {
                    yield pInvModel.insertInInventory(addedInventoryProduct);
                }
                if (modifyInventoryProduct.length) {
                    yield Promise.all(modifyInventoryProduct.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield pInvModel.updateInInventory({ available_quantity: item.available_quantity }, { id: item.id });
                    })));
                }
                // Insert supplier ledger
                yield pInvModel.insertInvSupplierLedger({
                    supplier_id,
                    hotel_code,
                    ledger_debit_amount: grand_total,
                    ledger_details: `Balance will be debited from hotel for sell something from supplier`,
                });
                if (paid_amount > 0) {
                    yield cmnInvModel.insertSupplierPayment({
                        created_by: admin_id,
                        hotel_code: hotel_code,
                        purchase_id: createdPurchase[0].id,
                        total_paid_amount: paid_amount,
                        ac_tr_ac_id,
                        supplier_id,
                        payment_no: `PUR-${year}${purchase_no}`,
                        payment_type: payment_type,
                    });
                    // get last account ledger
                    // const lastAL = await accModel.getLastAccountLedgerId(
                    // 	hotel_code
                    // );
                    // const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                    // Insert account ledger
                    // await accModel.insertAccountLedger({
                    // 	ac_tr_ac_id,
                    // 	hotel_code,
                    // 	transaction_no: `PUR-${year}${purchase_no}`,
                    // 	ledger_debit_amount: paid_amount,
                    // 	ledger_details: `Balance Debited by Purchase`,
                    // });
                    // Insert supplier ledger
                    yield pInvModel.insertInvSupplierLedger({
                        ac_tr_ac_id,
                        supplier_id,
                        hotel_code,
                        ledger_credit_amount: paid_amount,
                        ledger_details: `Balance credited for sell something`,
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Purchase created successfully.",
                };
            }));
        });
    }
    // Get all Purchase
    getAllPurchase(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, supplier_id, due } = req.query;
            const model = this.Model.purchaseInventoryModel();
            const { data, total } = yield model.getAllpurchase({
                key: key,
                limit: limit,
                skip: skip,
                by_supplier_id: parseInt(supplier_id),
                hotel_code,
                due: parseInt(due),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // Get Single Purchase
    getSinglePurchase(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.purchaseInventoryModel().getSinglePurchase(parseInt(id), hotel_code);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // create purchase money reciept
    createPurchaseMoneyReciept(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { ac_tr_ac_id, supplier_id, paid_amount, reciept_type, purchase_id, remarks, } = req.body;
                //   checking supplier
                const cmnInvModel = this.Model.CommonInventoryModel(trx);
                // Check account
                const accModel = this.Model.accountModel(trx);
                // Check purchase
                const pInvModel = this.Model.purchaseInventoryModel(trx);
                const checkSupplier = yield cmnInvModel.getSingleSupplier(supplier_id, hotel_code);
                if (!checkSupplier.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "User not found",
                    };
                }
                // const check account
                const accountModel = this.Model.accountModel(trx);
                const checkAccount = yield accountModel.getSingleAccount({
                    hotel_code,
                    id: parseInt(ac_tr_ac_id),
                });
                if (!checkAccount.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
                }
                // check invoice
                if (reciept_type === "invoice") {
                    const checkSinglePurchase = yield pInvModel.getSinglePurchase(purchase_id, hotel_code);
                    console.log({ checkSinglePurchase });
                    if (!checkSinglePurchase.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invoice not found with this user",
                        };
                    }
                    const { due, grand_total, voucher_no, supplier_id } = checkSinglePurchase[0];
                    console.log({ checkSinglePurchase });
                    if (due == 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Already paid this invoice",
                        };
                    }
                    if (paid_amount != due) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Invoice due and paid amount are not same",
                        };
                    }
                    // get last account ledger
                    const lastAL = yield accountModel.getLastAccountLedgerId(hotel_code);
                    const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                    const year = new Date().getFullYear();
                    // Insert account ledger
                    const ledgerRes = yield accModel.insertAccountLedger({
                        ac_tr_ac_id,
                        hotel_code,
                        transaction_no: `TRX-${year - ledger_id}`,
                        ledger_debit_amount: paid_amount,
                        ledger_details: `Balance Debited by Purchase`,
                    });
                    // Insert supplier ledger
                    yield pInvModel.insertInvSupplierLedger({
                        ac_tr_ac_id,
                        supplier_id,
                        hotel_code,
                        acc_ledger_id: ledgerRes[0],
                        ledger_credit_amount: paid_amount,
                        ledger_details: `Balance credited for sell something`,
                    });
                    // ================= update purchase ================ //
                    const remainingBalance = due - paid_amount;
                    yield pInvModel.updatePurchase({
                        due: remainingBalance,
                    }, { id: purchase_id });
                    // insert in payment supplier
                    yield cmnInvModel.insertSupplierPayment({
                        ac_tr_ac_id,
                        created_by: admin_id,
                        hotel_code: hotel_code,
                        purchase_id,
                        total_paid_amount: paid_amount,
                        supplier_id,
                    });
                }
                else {
                    // overall payment step
                    const { data: allPurchaseInvoiceByUser } = yield pInvModel.getAllpurchase({
                        hotel_code,
                        by_supplier_id: supplier_id,
                    });
                    const unpaidInvoice = [];
                    for (let i = 0; i < (allPurchaseInvoiceByUser === null || allPurchaseInvoiceByUser === void 0 ? void 0 : allPurchaseInvoiceByUser.length); i++) {
                        if (parseFloat(allPurchaseInvoiceByUser[i].due) !== 0) {
                            unpaidInvoice.push({
                                id: allPurchaseInvoiceByUser[i].id,
                                grand_total: allPurchaseInvoiceByUser[i].grand_total,
                                due: allPurchaseInvoiceByUser[i].due,
                                voucher_no: allPurchaseInvoiceByUser[i].voucher_no,
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
                    console.log({ unpaidInvoice });
                    for (let i = 0; i < unpaidInvoice.length; i++) {
                        if (remainingPaidAmount > 0) {
                            if (paid_amount >= unpaidInvoice[i].due) {
                                remainingPaidAmount =
                                    paid_amount - unpaidInvoice[i].due;
                                paidingInvoice.push({
                                    id: unpaidInvoice[i].id,
                                    due: unpaidInvoice[i].due - unpaidInvoice[i].due,
                                    purchase_id,
                                    total_paid_amount: unpaidInvoice[i].due,
                                });
                            }
                            else {
                                remainingPaidAmount =
                                    paid_amount - unpaidInvoice[i].due;
                                paidingInvoice.push({
                                    id: unpaidInvoice[i].id,
                                    due: unpaidInvoice[i].due - paid_amount,
                                    purchase_id,
                                    total_paid_amount: unpaidInvoice[i].due - paid_amount,
                                });
                            }
                        }
                    }
                    // =============== update purchase ==============//
                    yield Promise.all(paidingInvoice.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield pInvModel.updatePurchase({ due: item.due }, { id: item.id });
                    })));
                    const year = new Date().getFullYear();
                    // get last account ledger
                    const lastAL = yield accountModel.getLastAccountLedgerId(hotel_code);
                    const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                    // Insert account ledger
                    yield accModel.insertAccountLedger({
                        ac_tr_ac_id,
                        hotel_code,
                        transaction_no: `TRX-${year - ledger_id}`,
                        ledger_debit_amount: paid_amount,
                        ledger_details: `Balance Debited by purchase Money Reciept`,
                    });
                    // Insert supplier ledger
                    yield pInvModel.insertInvSupplierLedger({
                        ac_tr_ac_id,
                        supplier_id,
                        hotel_code,
                        ledger_credit_amount: paid_amount,
                        ledger_details: `Balance credited by purchase Money Reciept`,
                    });
                    // money recipet item
                    yield Promise.all(paidingInvoice.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield cmnInvModel.insertSupplierPayment({
                            created_by: admin_id,
                            hotel_code,
                            purchase_id: purchase_id[0],
                            total_paid_amount: item.total_paid_amount,
                            ac_tr_ac_id,
                            supplier_id,
                        });
                    })));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.default = PurchaseInvService;
//# sourceMappingURL=purchase.service.js.map