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
class PurchaseService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create purchase
    createPurchase(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { res_id, id: res_admin, name, hotel_code } = req.rest_user;
                const { purchase_items, purchase_date, supplier_id, ac_tr_ac_id, discount_amount, } = req.body;
                // Check account
                const model = this.Model.restaurantModel(trx);
                const accModel = this.Model.accountModel(trx);
                const checkSupplier = yield this.Model.CommonInventoryModel(trx).getSingleSupplier(supplier_id, hotel_code);
                console.log(req.body, res_id);
                console.log({ checkSupplier });
                if (!checkSupplier.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Invalid Supplier Information",
                    };
                }
                const checkAccount = yield accModel.getSingleAccount({
                    res_id,
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
                const last_balance = checkAccount[0].last_balance;
                const sub_total = purchase_items.reduce((acc, curr) => {
                    return acc + curr.quantity * curr.price;
                }, 0);
                const grand_total = sub_total - discount_amount;
                if (last_balance < grand_total) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Insufficient balance in this account for payment",
                    };
                }
                if (discount_amount > grand_total) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Discount amount cannot be greater than grand total",
                    };
                }
                const year = new Date().getFullYear();
                //   insert purchase
                const createdPurchase = yield model.createPurchase({
                    res_id,
                    purchase_date,
                    supplier_id,
                    ac_tr_ac_id,
                    sub_total,
                    discount_amount,
                    grand_total,
                });
                const purchaseId = createdPurchase[0];
                const purchaseItemsPayload = [];
                console.log({ purchase_items });
                for (let i = 0; i < purchase_items.length; i++) {
                    let found = false;
                    for (let j = 0; j < purchaseItemsPayload.length; j++) {
                        if (purchase_items[i].ingredient_id ==
                            purchaseItemsPayload[j].ingredient_id) {
                            found = true;
                            purchaseItemsPayload[j].quantity += purchase_items[i].quantity;
                            purchaseItemsPayload[j].price +=
                                purchase_items[i].price * purchase_items[i].quantity;
                            break;
                        }
                    }
                    console.log({ purchaseItemsPayload });
                    if (!found) {
                        purchaseItemsPayload.push({
                            ingredient_id: purchase_items[i].ingredient_id,
                            name: purchase_items[i].name,
                            purchase_id: purchaseId,
                            price: purchase_items[i].price * purchase_items[i].quantity,
                            quantity: purchase_items[i].quantity,
                        });
                    }
                }
                //   insert purchase item
                yield model.createPurchaseItem(purchaseItemsPayload);
                // =================== inventory step =================//
                const modifyInventoryIngredient = [];
                const addedInventoryIngredient = [];
                const purchase_ing_ids = purchase_items.map((item) => item.ingredient_id);
                const getInventoryIngredient = yield model.getAllInventory({
                    res_id,
                    ing_ids: purchase_ing_ids,
                });
                console.log({ getInventoryIngredient });
                for (let i = 0; i < purchaseItemsPayload.length; i++) {
                    let found = false;
                    for (let j = 0; j < (getInventoryIngredient === null || getInventoryIngredient === void 0 ? void 0 : getInventoryIngredient.length); j++) {
                        if (purchaseItemsPayload[i].ingredient_id ==
                            getInventoryIngredient[j].ing_id) {
                            found = true;
                            modifyInventoryIngredient.push({
                                available_quantity: parseFloat(getInventoryIngredient[j].available_quantity) +
                                    purchaseItemsPayload[i].quantity,
                                id: getInventoryIngredient[j].id,
                            });
                            break;
                        }
                    }
                    if (!found) {
                        addedInventoryIngredient.push({
                            res_id,
                            available_quantity: purchaseItemsPayload[i].quantity,
                            ing_id: purchaseItemsPayload[i].ingredient_id,
                        });
                    }
                }
                // insert in inventory
                if (addedInventoryIngredient.length) {
                    yield model.insertInInventory(addedInventoryIngredient);
                }
                // get last acc ledger id
                const lastAL = yield accModel.getLastAccountLedgerId(hotel_code);
                const acc_ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                // Insert account ledger
                const accLedgerRes = yield accModel.insertAccountLedger({
                    ac_tr_ac_id,
                    hotel_code,
                    transaction_no: `TRX-RESTURANT-PUR-${year}${acc_ledger_id}`,
                    ledger_debit_amount: grand_total,
                    ledger_details: `Balance Debited by Purchase`,
                });
                const pInvModel = this.Model.purchaseInventoryModel(trx);
                const cmnInvModel = this.Model.CommonInventoryModel(trx);
                // Insert supplier ledger
                yield pInvModel.insertInvSupplierLedger({
                    ac_tr_ac_id,
                    supplier_id,
                    hotel_code,
                    res_id,
                    acc_ledger_id: accLedgerRes[0],
                    ledger_credit_amount: grand_total,
                    ledger_details: `Balance credited for sell something`,
                });
                // insert in payment supplier
                yield cmnInvModel.insertSupplierPayment({
                    ac_tr_ac_id,
                    created_by: res_admin,
                    hotel_code: hotel_code,
                    purchase_id: purchaseId,
                    total_paid_amount: grand_total,
                    supplier_id,
                    res_id,
                });
                if (modifyInventoryIngredient.length) {
                    yield Promise.all(modifyInventoryIngredient.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield model.updateInInventory({ available_quantity: item.available_quantity }, { id: item.id });
                    })));
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
            const { res_id } = req.rest_user;
            const { limit, skip } = req.query;
            const model = this.Model.restaurantModel();
            const { data, total } = yield model.getAllpurchase({
                limit: limit,
                skip: skip,
                res_id,
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
            const { res_id } = req.rest_user;
            const data = yield this.Model.restaurantModel().getSinglePurchase(parseInt(id), res_id);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    // Get all Account
    getAllAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { ac_type, key, status, limit, skip, admin_id } = req.query;
            // model
            const model = this.Model.accountModel();
            const { data, total } = yield model.getAllAccounts({
                hotel_code,
                status: status,
                ac_type: ac_type,
                key: key,
                limit: limit,
                skip: skip,
                admin_id: parseInt(admin_id),
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
exports.default = PurchaseService;
//# sourceMappingURL=purchase.service.js.map