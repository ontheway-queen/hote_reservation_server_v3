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
class StockInvService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create Stock
    createStock(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { hotel_code, id: hotel_admin_id } = req.hotel_admin;
                const { stock_in, stock_out, note, stock_items } = req.body;
                // Check purchase
                const PModel = this.Model.stockInventoryModel(trx);
                if (stock_in) {
                    // Check account
                    const Model = this.Model.accountModel(trx);
                    const checkAccount = yield Model.getSingleAccount({
                        hotel_code,
                        id: req.body.ac_tr_ac_id,
                    });
                    if (!checkAccount.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Account not found",
                        };
                    }
                    // const last_balance = checkAccount[0].last_balance;
                    // if (last_balance < req.body.paid_amount) {
                    //   return {
                    //     success: false,
                    //     code: this.StatusCode.HTTP_BAD_REQUEST,
                    //     message: "Insufficient balance in this account for payment",
                    //   };
                    // }
                    // get last account ledger
                    // const lastAL = await Model.getLastAccountLedgerId(hotel_code);
                    // const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                    // const year = new Date().getFullYear();
                    // // Insert account ledger
                    // await Model.insertAccountLedger({
                    //   ac_tr_ac_id: req.body.ac_tr_ac_id,
                    //   hotel_code,
                    //   transaction_no: `TRX-${year - ledger_id}`,
                    //   ledger_debit_amount: req.body.paid_amount,
                    //   ledger_details: `Balance Debited by Update Stock`,
                    // });
                    // Insert purchase
                    const createdStock = yield PModel.createStockIn({
                        hotel_code,
                        created_by: req.hotel_admin.id,
                        ac_tr_ac_id: req.body.ac_tr_ac_id,
                        status: "in",
                        note,
                        paid_amount: req.body.paid_amount,
                    });
                    // Insert purchase item
                    const stockItemsPayload = [];
                    for (const item of stock_items) {
                        const existingItem = stockItemsPayload.find((p) => p.product_id === item.product_id);
                        if (existingItem) {
                            existingItem.quantity += item.quantity;
                        }
                        else {
                            stockItemsPayload.push({
                                product_id: item.product_id,
                                stock_id: createdStock[0].id,
                                quantity: item.quantity,
                            });
                        }
                    }
                    yield PModel.createStockItem(stockItemsPayload);
                    // Inventory step
                    const modifyInventoryProduct = [];
                    const addedInventoryProduct = [];
                    const purchase_product_ids = stock_items.map((item) => item.product_id);
                    const getInventoryProduct = yield PModel.getAllInventory({
                        hotel_code,
                        product_id: purchase_product_ids,
                    });
                    for (const payloadItem of stockItemsPayload) {
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
                        yield PModel.insertInInventory(addedInventoryProduct);
                    }
                    if (modifyInventoryProduct.length) {
                        yield Promise.all(modifyInventoryProduct.map((item) => __awaiter(this, void 0, void 0, function* () {
                            yield PModel.updateInInventory({ available_quantity: item.available_quantity }, { id: item.id });
                        })));
                    }
                }
                if (stock_out) {
                    // Insert purchase
                    const createdStock = yield PModel.createStockOut({
                        hotel_code,
                        note,
                        status: "out",
                        created_by: hotel_admin_id,
                    });
                    // Insert purchase item
                    const stockItemsPayload = [];
                    for (const item of stock_items) {
                        const existingItem = stockItemsPayload.find((p) => p.product_id === item.product_id);
                        if (existingItem) {
                            existingItem.quantity += item.quantity;
                        }
                        else {
                            stockItemsPayload.push({
                                product_id: item.product_id,
                                stock_id: createdStock[0].id,
                                quantity: item.quantity,
                            });
                        }
                    }
                    yield PModel.createStockItem(stockItemsPayload);
                    // Inventory step
                    const modifyInventoryProduct = [];
                    const purchase_product_ids = stock_items.map((item) => item.product_id);
                    const getInventoryProduct = yield PModel.getAllInventory({
                        hotel_code,
                        product_id: purchase_product_ids,
                    });
                    for (const payloadItem of stockItemsPayload) {
                        const inventoryItem = getInventoryProduct.find((g) => g.product_id === payloadItem.product_id);
                        if (inventoryItem) {
                            modifyInventoryProduct.push({
                                available_quantity: parseFloat(inventoryItem.available_quantity) -
                                    payloadItem.quantity,
                                quantity_used: parseFloat(inventoryItem.quantity_used) +
                                    payloadItem.quantity,
                                id: inventoryItem.id,
                            });
                        }
                    }
                    if (modifyInventoryProduct.length) {
                        yield Promise.all(modifyInventoryProduct.map((item) => __awaiter(this, void 0, void 0, function* () {
                            yield PModel.updateInInventory({
                                available_quantity: item.available_quantity,
                                quantity_used: item.quantity_used,
                            }, { id: item.id });
                        })));
                    }
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_SUCCESSFUL,
                        message: "Stock Out successfully.",
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Stock In successfully.",
                };
            }));
        });
    }
    // Get all Stock
    getAllStock(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code } = req.hotel_admin;
            const { limit, skip, key, status } = req.query;
            const model = this.Model.stockInventoryModel();
            const { data, total } = yield model.getAllStock({
                key: key,
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
    // Get Single Stock
    getSingleStock(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const data = yield this.Model.stockInventoryModel().getSingleStock(parseInt(id), hotel_code);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateStockService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hotel_code } = req.hotel_admin;
            const { product_id, type, quantity } = req.body;
            const model = this.Model.stockInventoryModel();
            const inventoryModel = this.Model.inventoryModel();
            const check = yield model.getSingleStock(parseInt(id), hotel_code);
            if (!check) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Stock not found",
                };
            }
            const { stock_items } = check;
            const findProduct = stock_items.find((p) => p.product_id === product_id);
            if (!findProduct) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Product not found",
                };
            }
            const isInventoryExists = yield inventoryModel.getSingleInventoryDetails({
                hotel_code,
                product_id: findProduct.product_id,
            });
            if (!isInventoryExists) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Inventory not found",
                };
            }
            if (type === "increase") {
                yield model.updateStockItems({ quantity: Number(findProduct.quantity) + quantity }, { id: findProduct.id });
                yield model.updateInInventory({
                    available_quantity: isInventoryExists.available_quantity + quantity,
                }, { product_id: findProduct.product_id });
            }
            else {
                if (findProduct.quantity < quantity) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Stock not enough",
                    };
                }
                yield model.updateStockItems({ quantity: findProduct.quantity - quantity }, { id: findProduct.id });
                yield model.updateInInventory({
                    available_quantity: isInventoryExists.available_quantity - quantity,
                }, { product_id: findProduct.product_id });
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Stock updated successfully",
            };
        });
    }
}
exports.default = StockInvService;
//# sourceMappingURL=stock.service.js.map