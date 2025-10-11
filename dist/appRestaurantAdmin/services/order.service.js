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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
class RestaurantOrderService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const _a = req.body, { order_items } = _a, rest = __rest(_a, ["order_items"]);
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const { data } = yield restaurantTableModel.getTables({
                    id: rest.table_id,
                    hotel_code,
                    restaurant_id,
                });
                if (data.length > 0 && data[0].status === "booked") {
                    throw new customEror_1.default("Table is already booked", this.StatusCode.HTTP_CONFLICT);
                }
                else if (data.length === 0) {
                    throw new customEror_1.default("Table not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const orderNo = yield lib_1.default.generateOrderNo(trx, hotel_code, restaurant_id);
                let sub_total = 0;
                let grand_Total = 0;
                let vat_amount = 0;
                let net_total = 0;
                for (const item of order_items) {
                    const food = yield restaurantFoodModel.getFoods({
                        id: item.food_id,
                        hotel_code,
                        restaurant_id,
                    });
                    if (!food.data.length) {
                        throw new customEror_1.default("Food not found", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    sub_total += Number(item.quantity) * Number(food.data[0].retail_price);
                }
                net_total = lib_1.default.adjustPercentageOrFixedAmount(sub_total, rest.discount, rest.discount_type, true);
                grand_Total = lib_1.default.adjustPercentageOrFixedAmount(net_total, rest.service_charge, rest.service_charge_type);
                if ((rest === null || rest === void 0 ? void 0 : rest.vat_rate) > 0) {
                    vat_amount = (net_total * rest.vat_rate) / 100;
                    grand_Total = grand_Total + vat_amount;
                }
                const [newOrder] = yield restaurantOrderModel.createOrder({
                    hotel_code,
                    restaurant_id,
                    order_no: orderNo,
                    created_by: id,
                    table_id: rest.table_id,
                    order_type: rest.order_type,
                    guest: rest.guest,
                    sub_total: sub_total,
                    discount: rest.discount,
                    discount_type: rest.discount_type,
                    net_total: net_total,
                    service_charge: rest.service_charge,
                    service_charge_type: rest.service_charge_type,
                    vat_rate: rest.vat_rate,
                    vat_amount: vat_amount,
                    grand_total: grand_Total,
                    staff_id: rest.staff_id,
                    room_no: rest.room_no,
                });
                yield Promise.all(order_items.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const food = yield restaurantFoodModel.getFoods({
                        id: item.food_id,
                        hotel_code,
                        restaurant_id,
                    });
                    if (!food.data.length) {
                        throw new customEror_1.default("Food not found", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    yield restaurantOrderModel.createOrderItems({
                        order_id: newOrder.id,
                        food_id: item.food_id,
                        name: food.data[0].name,
                        rate: Number(food.data[0].retail_price),
                        quantity: Number(item.quantity),
                        total: Number(item.quantity) * Number(food.data[0].retail_price),
                    });
                })));
                yield restaurantTableModel.updateTable({
                    id: rest.table_id,
                    payload: {
                        status: "booked",
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order Confirmed Successfully.",
                    data: { id: newOrder.id },
                };
            }));
        });
    }
    getOrders(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, table_id, from_date, to_date, order_type, kitchen_status, status, } = req.query;
            const data = yield this.restaurantModel.restaurantOrderModel().getOrders({
                limit: Number(limit),
                skip: Number(skip),
                hotel_code,
                restaurant_id,
                table_id: Number(table_id),
                from_date: from_date,
                to_date: to_date,
                order_type: order_type,
                kitchen_status: kitchen_status,
                status: status,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    getOrderById(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const data = yield this.restaurantModel
                .restaurantOrderModel()
                .getOrderById({
                hotel_code,
                restaurant_id,
                id: Number(id),
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Order not found.",
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
            };
        });
    }
    getOrdersByTableId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { table_id } = req.params;
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const data = yield this.restaurantModel
                .restaurantOrderModel()
                .getOrderById({
                hotel_code,
                restaurant_id,
                table_id: Number(table_id),
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_OK,
                    data: {},
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
            };
        });
    }
    cancelOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const isOrderExists = yield restaurantOrderModel.getOrderById({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (!isOrderExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Order not found.",
                    };
                }
                yield restaurantOrderModel.cancelOrder({
                    id: parseInt(id),
                });
                yield restaurantTableModel.updateTable({
                    id: isOrderExists.table_id,
                    payload: {
                        status: "available",
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order canceled successfully.",
                };
            }));
        });
    }
    completeOrderPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const body = req.body;
                if (body.payable_amount <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Invalid amount. Please provide a valid payment amount.",
                    };
                }
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantTableModel = this.restaurantModel.restaurantTableModel(trx);
                const isOrderExists = yield restaurantOrderModel.getOrderById({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (!isOrderExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Order not found.",
                    };
                }
                if (isOrderExists.is_paid === true) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Order already paid.",
                    };
                }
                if (Number(isOrderExists.grand_total) > Number(body.payable_amount)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Insufficient payment. Please provide the full amount.",
                    };
                }
                const changeable_amount = Number(body.payable_amount) - Number(isOrderExists.grand_total);
                yield restaurantOrderModel.completeOrderPayment({
                    id: parseInt(id),
                }, {
                    payable_amount: body.payable_amount,
                    changeable_amount,
                    is_paid: true,
                    status: "completed",
                });
                yield restaurantTableModel.updateTable({
                    id: isOrderExists.table_id,
                    payload: {
                        status: "available",
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order paid successfully.",
                };
            }));
        });
    }
    getKitchenOrders(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { restaurant_id, hotel_code } = req.restaurant_admin;
            const { limit, skip, order_no } = req.query;
            const data = yield this.restaurantModel
                .restaurantOrderModel()
                .getKitchenOrders({
                limit: Number(limit),
                skip: Number(skip),
                hotel_code,
                restaurant_id,
                order_no: order_no,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_SUCCESSFUL }, data);
        });
    }
    updateKitchenOrders(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { restaurant_id, hotel_code } = req.restaurant_admin;
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const isOrderExists = yield restaurantOrderModel.getOrderById({
                    hotel_code,
                    restaurant_id,
                    id: parseInt(id),
                });
                if (!isOrderExists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Order not found.",
                    };
                }
                if (isOrderExists.kitchen_status === "completed") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Order already completed.",
                    };
                }
                yield restaurantOrderModel.updateOrder({
                    id: parseInt(id),
                    payload: { kitchen_status: "completed" },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Your order has been cooked to perfection and is ready!",
                };
            }));
        });
    }
    updateOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const { id: order_id } = req.params;
                const _l = req.body, { order_items } = _l, rest = __rest(_l, ["order_items"]);
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const existingOrder = yield restaurantOrderModel.getOrderById({
                    id: Number(order_id),
                    hotel_code,
                    restaurant_id,
                });
                if (!existingOrder) {
                    throw new customEror_1.default("Order not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                let sub_total = 0;
                let grand_Total = 0;
                let vat_amount = 0;
                let net_total = 0;
                if (order_items === null || order_items === void 0 ? void 0 : order_items.length) {
                    for (const item of order_items) {
                        const food = yield restaurantFoodModel.getFoods({
                            id: item.food_id,
                            hotel_code,
                            restaurant_id,
                        });
                        if (!food.data.length) {
                            throw new customEror_1.default(`Food with ID ${item.food_id} not found`, this.StatusCode.HTTP_NOT_FOUND);
                        }
                        sub_total +=
                            Number(item.quantity) * Number(food.data[0].retail_price);
                    }
                    net_total = lib_1.default.adjustPercentageOrFixedAmount(sub_total, rest.discount, rest.discount_type, true);
                    grand_Total = lib_1.default.adjustPercentageOrFixedAmount(net_total, rest.service_charge, rest.service_charge_type);
                    if (rest.vat_rate && (rest === null || rest === void 0 ? void 0 : rest.vat_rate) > 0) {
                        vat_amount = (net_total * rest.vat_rate) / 100;
                        grand_Total = net_total + vat_amount;
                    }
                }
                else {
                    net_total = Number(existingOrder.net_total);
                    sub_total = Number(existingOrder.sub_total);
                    vat_amount = Number(existingOrder.vat_amount);
                    grand_Total = Number(existingOrder.grand_total);
                }
                const updatedOrder = yield restaurantOrderModel.updateOrder({
                    id: Number(order_id),
                    payload: {
                        order_type: (_a = rest.order_type) !== null && _a !== void 0 ? _a : existingOrder.order_type,
                        guest: (_b = rest.guest) !== null && _b !== void 0 ? _b : existingOrder.guest,
                        table_id: (_c = rest.table_id) !== null && _c !== void 0 ? _c : existingOrder.table_id,
                        staff_id: (_d = rest.staff_id) !== null && _d !== void 0 ? _d : existingOrder.staff_id,
                        room_no: (_e = rest.room_no) !== null && _e !== void 0 ? _e : existingOrder.room_no,
                        discount: (_f = rest.discount) !== null && _f !== void 0 ? _f : Number(existingOrder.discount),
                        discount_type: (_g = rest.discount_type) !== null && _g !== void 0 ? _g : existingOrder.discount_type,
                        service_charge: (_h = rest.service_charge) !== null && _h !== void 0 ? _h : Number(existingOrder.service_charge),
                        service_charge_type: (_j = rest.service_charge_type) !== null && _j !== void 0 ? _j : existingOrder.service_charge_type,
                        vat_rate: (_k = rest.vat_rate) !== null && _k !== void 0 ? _k : Number(existingOrder.vat_rate),
                        vat_amount,
                        net_total: net_total,
                        sub_total,
                        grand_total: grand_Total,
                        updated_by: id,
                    },
                });
                if (order_items === null || order_items === void 0 ? void 0 : order_items.length) {
                    yield restaurantOrderModel.deleteOrderItems({
                        order_id: Number(order_id),
                    });
                    yield Promise.all(order_items.map((item) => __awaiter(this, void 0, void 0, function* () {
                        const food = yield restaurantFoodModel.getFoods({
                            id: item.food_id,
                            hotel_code,
                            restaurant_id,
                        });
                        if (!food.data.length) {
                            throw new customEror_1.default(`Food with ID ${item.food_id} not found`, this.StatusCode.HTTP_NOT_FOUND);
                        }
                        yield restaurantOrderModel.createOrderItems({
                            order_id: Number(order_id),
                            food_id: item.food_id,
                            name: food.data[0].name,
                            rate: Number(food.data[0].retail_price),
                            quantity: Number(item.quantity),
                            total: Number(item.quantity) * Number(food.data[0].retail_price),
                        });
                    })));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order updated successfully.",
                    data: { id: updatedOrder[0].id },
                };
            }));
        });
    }
}
exports.default = RestaurantOrderService;
//# sourceMappingURL=order.service.js.map