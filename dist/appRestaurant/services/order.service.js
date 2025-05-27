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
exports.ResOrderService = void 0;
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
class ResOrderService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // ============== Create Order =============== //
    // Create Order
    createOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: res_admin, res_id, hotel_code } = req.rest_user;
                const { order_items, tab_id, note, email, name, staff_id, order_type, sub_tab_name, } = req.body;
                const model = this.Model.restaurantModel(trx);
                const guestModel = this.Model.guestModel(trx);
                const year = new Date().getFullYear();
                const month = new Date().getMonth() + 1;
                const day = new Date().getDate();
                let userID = null;
                let userLastBalance = 0;
                if (email) {
                    const checkUser = yield guestModel.getSingleGuest({
                        email,
                        hotel_code,
                    });
                    if (checkUser.length) {
                        userID = checkUser[0].id;
                        userLastBalance = checkUser[0].last_balance;
                    }
                    else {
                        const userRes = yield guestModel.createGuest({
                            name,
                            email,
                            hotel_code,
                        });
                        userID = userRes[0];
                    }
                    yield guestModel.createUserType({
                        user_id: userID,
                        user_type: "res-guest",
                    });
                }
                const orderItemIds = order_items.map((item) => item.food_id);
                // get all food order
                const { data: getAllFood } = yield model.getAllFood({
                    res_id,
                    ids: orderItemIds,
                });
                if (orderItemIds.length !== getAllFood.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid food id",
                    };
                }
                let grand_total = 0;
                const orderData = yield model.getAllIOrderForLastId();
                const orderNo = orderData.length ? orderData[0].id + 1 : 1;
                for (let i = 0; i < order_items.length; i++) {
                    for (let j = 0; j < getAllFood.length; j++) {
                        if (order_items[i].food_id == getAllFood[j].id) {
                            grand_total += order_items[i].quantity * getAllFood[i].retail_price;
                        }
                    }
                }
                const createdOrderRes = yield model.createOrder({
                    res_id,
                    user_id: userID,
                    token_no: `${year}${month}${day}-${orderNo}`,
                    order_no: `ORD-F${year}-${orderNo}`,
                    staff_id,
                    order_category: "front-desk",
                    status: "confirmed",
                    kitchen_status: "preparing",
                    order_type,
                    note,
                    grand_total,
                    sub_total: grand_total,
                    created_by: res_admin,
                });
                const orderItems = [];
                for (let i = 0; i < order_items.length; i++) {
                    for (let j = 0; j < getAllFood.length; j++) {
                        if (order_items[i].food_id == getAllFood[j].id) {
                            orderItems.push({
                                food_id: order_items[i].food_id,
                                name: getAllFood[j].food_name,
                                order_id: createdOrderRes[0],
                                quantity: order_items[i].quantity,
                                rate: getAllFood[i].retail_price,
                                total: order_items[i].quantity * getAllFood[i].retail_price,
                            });
                        }
                    }
                }
                // insert order items
                yield model.insertOrderItems(orderItems);
                const table_order_pld = {
                    res_id,
                    order_id: createdOrderRes[0],
                    tab_id,
                    name: sub_tab_name,
                    status: "booked",
                };
                // insert in table order
                yield model.insertInTableOrder(table_order_pld);
                // update res table status
                yield model.updateTable(tab_id, res_id, { status: "booked" });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order Confirmed successfully.",
                };
            }));
        });
    }
    // Update Order
    updateOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { res_id } = req.rest_user;
                const { id } = req.params;
                const { order_items_modify } = req.body;
                const model = this.Model.restaurantModel(trx);
                const getSingleOrder = yield model.getSingleOrder(parseInt(id), res_id);
                if (!getSingleOrder.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const orderItemIds = order_items_modify.map((item) => item.food_id);
                // get all food order
                const { data: getAllFood } = yield model.getAllFood({
                    res_id,
                    ids: orderItemIds,
                });
                if (orderItemIds.length !== getAllFood.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid food id",
                    };
                }
                let grand_total = 0;
                for (let i = 0; i < order_items_modify.length; i++) {
                    for (let j = 0; j < getAllFood.length; j++) {
                        if (order_items_modify[i].food_id == getAllFood[j].id) {
                            grand_total +=
                                order_items_modify[i].quantity * getAllFood[i].retail_price;
                        }
                    }
                }
                // delete past order items
                yield model.deleteOrderItems(parseInt(id));
                const orderItems = [];
                for (let i = 0; i < order_items_modify.length; i++) {
                    for (let j = 0; j < getAllFood.length; j++) {
                        if (order_items_modify[i].food_id == getAllFood[j].id) {
                            orderItems.push({
                                food_id: order_items_modify[i].food_id,
                                name: getAllFood[j].food_name,
                                order_id: parseInt(id),
                                quantity: order_items_modify[i].quantity,
                                rate: getAllFood[i].retail_price,
                                total: order_items_modify[i].quantity * getAllFood[i].retail_price,
                            });
                        }
                    }
                }
                // insert order items
                yield model.insertOrderItems(orderItems);
                // update order
                yield model.updateOrder(parseInt(id), res_id, {
                    grand_total,
                    sub_total: grand_total,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order Updated successfully.",
                };
            }));
        });
    }
    //order payment
    OrderPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { res_id, id: res_admin, hotel_code } = req.rest_user;
                const { id } = req.params;
                const { discount, vat, ac_tr_ac_id, include_with_hotel, paid_amount } = req.body;
                const model = this.Model.restaurantModel(trx);
                const accModel = this.Model.accountModel(trx);
                const guestModel = this.Model.guestModel(trx);
                const getSingleOrder = yield model.getSingleOrder(parseInt(id), res_id);
                if (!getSingleOrder.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { guest_id, grand_total, table_id, order_no } = getSingleOrder[0];
                let nowPayableAmount = 0;
                nowPayableAmount = parseFloat(grand_total) + vat - discount;
                // get last acc ledger id
                const lastAL = yield accModel.getLastAccountLedgerId(hotel_code);
                const acc_ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
                const year = new Date().getFullYear();
                if (guest_id) {
                    if (include_with_hotel) {
                        // order update
                        yield model.updateOrder(parseInt(id), res_id, {
                            include_with_hotel: 1,
                            payable_amount: nowPayableAmount,
                            vat,
                            status: "finished",
                        });
                        // insert in user ledger
                        yield guestModel.insertGuestLedger({
                            hotel_code,
                            user_id: guest_id,
                            amount: nowPayableAmount,
                            pay_type: "debit",
                            name: order_no,
                        });
                    }
                    else {
                        // full payment or more payment than full payment
                        if (paid_amount < nowPayableAmount)
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: "Paid amount is less than payable amount",
                            };
                        // changeable amount step
                        const extra_amount = paid_amount - nowPayableAmount;
                        // Check account
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
                        // order update
                        yield model.updateOrder(parseInt(id), res_id, {
                            is_paid: 1,
                            ac_tr_ac_id,
                            status: "finished",
                            payable_amount: nowPayableAmount,
                            vat,
                            changeable_amount: extra_amount,
                        });
                        // =========================== last balance for credit =============== //
                        // insert account ledger
                        const accLedgerRes = yield accModel.insertAccountLedger({
                            ac_tr_ac_id,
                            hotel_code,
                            transaction_no: `TRX-RES-U-${year}${acc_ledger_id}`,
                            ledger_credit_amount: paid_amount,
                            ledger_details: `Balance has been credited by restaurant order, order id =${id}`,
                        });
                        // insert in user ledger
                        yield guestModel.insertGuestLedger({
                            hotel_code,
                            user_id: guest_id,
                            amount: paid_amount,
                            pay_type: "credit",
                            ac_tr_ac_id,
                            name: order_no,
                            acc_ledger_id: accLedgerRes[0],
                        });
                    }
                }
                else {
                    if (include_with_hotel && !guest_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "You cannot include with hotel cause this user has no account",
                        };
                    }
                    if (paid_amount < nowPayableAmount)
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: "Paid amount is less than payable amount",
                        };
                    // Check account
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
                    // changeable amount step
                    const extra_amount = paid_amount - nowPayableAmount;
                    // order update
                    yield model.updateOrder(parseInt(id), res_id, {
                        is_paid: 1,
                        ac_tr_ac_id,
                        vat,
                        status: "finished",
                        payable_amount: nowPayableAmount,
                        changeable_amount: extra_amount,
                    });
                }
                //==============================//
                // Insert account ledger
                yield accModel.insertAccountLedger({
                    ac_tr_ac_id,
                    hotel_code,
                    transaction_no: `TRX-RES-U-${year}${acc_ledger_id}`,
                    ledger_credit_amount: nowPayableAmount,
                    ledger_details: `Balance Credited by Restaurant order`,
                });
                // check if any sub table booked or not, if not then main res table status will be changed
                const { data: orderExistOrNot } = yield model.getAllOrder({
                    res_id,
                    tab_id: table_id,
                    limit: "1",
                    skip: "0",
                    status: "confirmed",
                });
                if (!orderExistOrNot.length) {
                    yield model.updateTable(table_id, res_id, { status: "available" });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Order Payment successfully",
                };
            }));
        });
    }
    // Get all Order
    getAllOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { res_id } = req.rest_user;
            const { limit, skip, status, kitchen_status, order_category, staff_name, is_paid, from_date, to_date, key, tab_id, } = req.query;
            const model = this.Model.restaurantModel();
            const { data, total } = yield model.getAllOrder({
                kitchen_status: kitchen_status,
                order_category: order_category,
                is_paid: is_paid,
                staff_name: staff_name,
                tab_id: parseInt(tab_id),
                status: status,
                key: key,
                limit: limit,
                skip: skip,
                from_date: from_date,
                to_date: to_date,
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
    // get single Order
    getSingleOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { res_id } = req.rest_user;
            const data = yield this.Model.restaurantModel().getSingleOrder(parseInt(id), res_id);
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
    // Get all Kitchen order
    getAllKitchenOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { res_id } = req.rest_user;
            const model = this.Model.restaurantModel();
            const { limit, skip, order_no, table_name, kitchen_status } = req.query;
            const { data, total } = yield model.getAllKitchenOrder({
                res_id,
                order_no: order_no,
                table_name: table_name,
                kitchen_status: kitchen_status,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // Update kitchen status
    updateKitchenStatus(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { res_id } = req.rest_user;
                const { id } = req.params;
                const model = this.Model.restaurantModel(trx);
                const getSingleOrder = yield model.getSingleOrder(parseInt(id), res_id);
                if (!getSingleOrder.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Order not found",
                    };
                }
                const { kitchen_status, order_items } = getSingleOrder[0];
                if (kitchen_status == "completed") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Already updated",
                    };
                }
                const food_ids = order_items.map((item) => item.food_id);
                // get all food
                const { data: getAllFood } = yield model.getAllFood({
                    res_id,
                    ids: food_ids,
                });
                let allFoodIngredients = [];
                for (let i = 0; i < getAllFood.length; i++) {
                    allFoodIngredients = [
                        ...allFoodIngredients,
                        ...getAllFood[i].food_items,
                    ];
                }
                let bundleAllFoodIngredients = [];
                for (let i = 0; i < allFoodIngredients.length; i++) {
                    let found = false;
                    for (let j = 0; j < bundleAllFoodIngredients.length; j++) {
                        if (allFoodIngredients[i].ingredient_id ==
                            bundleAllFoodIngredients[j].ingredient_id) {
                            bundleAllFoodIngredients[j].ing_quantity +=
                                allFoodIngredients[i].ing_quantity;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        bundleAllFoodIngredients.push({
                            ingredient_id: allFoodIngredients[i].ingredient_id,
                            ing_quantity: allFoodIngredients[i].ing_quantity,
                        });
                    }
                }
                const ing_ids = allFoodIngredients.map((item) => item.ingredient_id);
                // get ingredients from inventory
                const getInventoryIngredients = yield model.getAllInventory({
                    res_id,
                    ing_ids,
                });
                const remainIngredient = [];
                for (let i = 0; i < getInventoryIngredients.length; i++) {
                    for (let j = 0; j < bundleAllFoodIngredients.length; j++) {
                        if (getInventoryIngredients[i].ing_id ==
                            bundleAllFoodIngredients[j].ingredient_id) {
                            remainIngredient.push({
                                id: getInventoryIngredients[i].id,
                                available_quantity: getInventoryIngredients[i].available_quantity -
                                    bundleAllFoodIngredients[j].ing_quantity,
                            });
                        }
                    }
                }
                // now inventory update
                Promise.all(remainIngredient.map((item) => __awaiter(this, void 0, void 0, function* () {
                    yield model.updateInInventory({ available_quantity: item.available_quantity }, { id: item.id });
                })));
                const res = yield model.updateKitchenStatus(parseInt(id), {
                    kitchen_status: req.body.kitchen_status,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Kitchen Status updated successfully",
                };
            }));
        });
    }
    // get All guest service
    getAllGuest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, email, limit, skip, user_type } = req.query;
            const { hotel_code } = req.rest_user;
            // model
            const model = this.Model.restaurantModel();
            const { data, total } = yield model.getAllGuest({
                key: key,
                email: email,
                user_type: user_type,
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
    // create table Service
    createTable(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, res_id } = req.rest_user;
                const { name, category } = req.body;
                const Model = this.Model.restaurantModel();
                // table check
                const { data: checkName } = yield Model.getAllTableName({
                    name,
                    res_id,
                });
                if (checkName.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Table Name already exists, give another unique name",
                    };
                }
                yield Model.createTable({
                    res_id,
                    name,
                    category,
                    created_by: id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Table created successfully.",
                };
            }));
        });
    }
    // Get all Table
    getAllTable(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { res_id } = req.rest_user;
            const { limit, skip, name, category } = req.query;
            const model = this.Model.restaurantModel();
            const { data, total } = yield model.getAllTable({
                res_id,
                name: name,
                category: category,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    // Update table
    updateTableName(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { res_id } = req.rest_user;
                const { id } = req.params;
                const updatePayload = req.body;
                const model = this.Model.restaurantModel(trx);
                const getSingleTable = yield model.getSingleTable(parseInt(id), res_id);
                const table_status = getSingleTable.table_status;
                if (table_status != "booked") {
                    yield model.updateTableName(parseInt(id), res_id, {
                        name: updatePayload.name,
                        status: updatePayload.status,
                    });
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Table updated successfully",
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Table Status is Booked so can't update",
                    };
                }
            }));
        });
    }
    // Get all Employee
    getAllEmployee(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotel_code, res_id } = req.rest_user;
            const { limit, skip, key } = req.query;
            const model = this.Model.restaurantModel();
            const { data, total } = yield model.getAllEmployee({
                key: key,
                limit: limit,
                skip: skip,
                hotel_code,
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
}
exports.ResOrderService = ResOrderService;
exports.default = ResOrderService;
//# sourceMappingURL=order.service.js.map