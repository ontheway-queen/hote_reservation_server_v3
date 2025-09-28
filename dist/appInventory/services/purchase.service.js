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
const helperLib_1 = __importDefault(require("../../appAdmin/utlis/library/helperLib"));
class PurchaseInvService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createPurchase(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: admin_id } = req.hotel_admin;
                const { purchase_date, supplier_id, ac_tr_ac_id, discount_amount, vat, shipping_cost, paid_amount, purchase_items, } = req.body;
                // Check supplier
                const supplierModel = this.Model.supplierModel(trx);
                // Check account
                const accModel = this.Model.accountModel(trx);
                // Check purchase
                const pInvModel = this.Model.purchaseInventoryModel(trx);
                const pdModel = this.Model.inventoryModel(trx);
                const checkSupplier = yield supplierModel.getSingleSupplier(supplier_id, hotel_code);
                if (!checkSupplier.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Supplier not found",
                    };
                }
                const checkAccount = yield accModel.getSingleAccount({
                    hotel_code,
                    id: ac_tr_ac_id,
                });
                if (!checkAccount.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Account not found",
                    };
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
                const grand_total = parseFloat(Number.parseFloat((sub_total + vat + shipping_cost - discount_amount).toString()).toFixed(2));
                const due = grand_total - paid_amount;
                if (paid_amount > grand_total) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Paid Amount cannot be greater than grand total",
                    };
                }
                if (discount_amount > grand_total) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Discount amount cannot be greater than grand total",
                    };
                }
                const p_voucher_no = yield new helperLib_1.default(trx).generatePurchaseVoucher();
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
                    voucher_no: p_voucher_no,
                });
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
                if (paid_amount > 0) {
                    // insert supplier payment
                    const [supplierPaymentID] = yield supplierModel.insertSupplierPayment({
                        created_by: admin_id,
                        hotel_code: hotel_code,
                        debit: paid_amount,
                        credit: 0,
                        acc_id: ac_tr_ac_id,
                        supplier_id,
                        purchase_id: createdPurchase[0].id,
                        voucher_no: p_voucher_no,
                        payment_date: new Date().toISOString(),
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
    getSinglePurchase(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.purchaseInventoryModel().getSinglePurchase(parseInt(id), hotel_code);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getInvoiceByPurchaseId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.purchaseInventoryModel().getSinglePurchase(parseInt(id), hotel_code);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getMoneyReceiptByPurchaseId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.hotelInvoiceModel().getMoneyReceiptByPurchaseId({
                id: Number(req.params.id),
                hotel_code: req.hotel_admin.hotel_code,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.default = PurchaseInvService;
//# sourceMappingURL=purchase.service.js.map