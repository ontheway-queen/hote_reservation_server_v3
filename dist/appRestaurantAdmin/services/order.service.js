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
                    // throw new CustomError(
                    //   "Table is already booked",
                    //   this.StatusCode.HTTP_CONFLICT
                    // );
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Table is already booked",
                    };
                }
                else if (data.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Table not found",
                    };
                }
                const orderNo = yield lib_1.default.generateOrderNo(trx, hotel_code, restaurant_id);
                let sub_total = 0;
                // food validation
                const foodIds = order_items.map((item) => item.food_id);
                const uniqueFoodIds = Array.from(new Set(foodIds));
                if (uniqueFoodIds.length !== order_items.length) {
                    throw new customEror_1.default("Duplicate food items found in the order.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                // get food and calculate sub_total
                const foodItems = yield restaurantFoodModel.getFoods({
                    hotel_code,
                    restaurant_id,
                    food_ids: uniqueFoodIds,
                });
                if (foodItems.data.length !== uniqueFoodIds.length) {
                    throw new customEror_1.default("One or more food items not found.", this.StatusCode.HTTP_NOT_FOUND);
                }
                // calculate sub_total and grand total
                foodItems.data.forEach((food) => {
                    const item = order_items.find((i) => i.food_id === food.id);
                    if (item) {
                        sub_total += Number(item.quantity) * Number(food.retail_price);
                    }
                });
                const discountAmount = lib_1.default.calculatePercentageToAmount(sub_total, rest.discount, rest.discount_type);
                let gross_amount = sub_total - discountAmount;
                const serviceChargeAmount = lib_1.default.calculatePercentageToAmount(gross_amount, rest.service_charge, rest.service_charge_type);
                gross_amount += serviceChargeAmount;
                const vatAmount = lib_1.default.calculatePercentageToAmount(gross_amount, rest.vat, rest.vat_type);
                gross_amount += vatAmount;
                const grand_total = gross_amount;
                const [newOrder] = yield restaurantOrderModel.createOrder({
                    hotel_code,
                    restaurant_id,
                    order_no: orderNo,
                    created_by: id,
                    table_id: rest.table_id,
                    order_type: rest.order_type,
                    guest_name: rest.guest_name,
                    sub_total: sub_total,
                    discount: rest.discount,
                    discount_type: rest.discount_type,
                    service_charge: rest.service_charge,
                    service_charge_type: rest.service_charge_type,
                    vat: rest.vat,
                    vat_type: rest.vat_type,
                    grand_total: grand_total,
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
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                const { id, restaurant_id, hotel_code } = req.restaurant_admin;
                const { id: order_id } = req.params;
                const _o = req.body, { order_items } = _o, rest = __rest(_o, ["order_items"]);
                const restaurantOrderModel = this.restaurantModel.restaurantOrderModel(trx);
                const restaurantFoodModel = this.restaurantModel.restaurantFoodModel(trx);
                const existingOrder = yield restaurantOrderModel.getOrderById({
                    id: Number(order_id),
                    hotel_code,
                    restaurant_id,
                });
                if (!existingOrder) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Order not found",
                    };
                }
                // again caluculate sub_total, grand_total
                let sub_total = 0;
                let foodItemsCopy = [];
                if (order_items && order_items.length > 0) {
                    const foodIds = order_items.map((item) => item.food_id);
                    const uniqueFoodIds = Array.from(new Set(foodIds));
                    if (uniqueFoodIds.length !== order_items.length) {
                        throw new customEror_1.default("Duplicate food items found in the order.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    // get food and calculate sub_total
                    const foodItems = yield restaurantFoodModel.getFoods({
                        hotel_code,
                        restaurant_id,
                        food_ids: uniqueFoodIds,
                    });
                    if (foodItems.data.length !== uniqueFoodIds.length) {
                        throw new customEror_1.default("One or more food items not found.", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    foodItemsCopy = foodItems.data;
                    // calculate sub_total and grand total
                    foodItems.data.forEach((food) => {
                        const item = order_items.find((i) => i.food_id === food.id);
                        if (item) {
                            sub_total += Number(item.quantity) * Number(food.retail_price);
                        }
                    });
                }
                const discountAmount = lib_1.default.calculatePercentageToAmount(sub_total, (_a = rest.discount) !== null && _a !== void 0 ? _a : Number(existingOrder.discount), (_b = rest.discount_type) !== null && _b !== void 0 ? _b : existingOrder.discount_type);
                console.log({ sub_total, discountAmount });
                let gross_amount = sub_total - discountAmount;
                const serviceChargeAmount = lib_1.default.calculatePercentageToAmount(gross_amount, (_c = rest.service_charge) !== null && _c !== void 0 ? _c : Number(existingOrder.service_charge), (_d = rest.service_charge_type) !== null && _d !== void 0 ? _d : existingOrder.service_charge_type);
                gross_amount += serviceChargeAmount;
                const vatAmount = lib_1.default.calculatePercentageToAmount(gross_amount, (_e = rest.vat) !== null && _e !== void 0 ? _e : Number(existingOrder.vat), (_f = rest.vat_type) !== null && _f !== void 0 ? _f : existingOrder.vat_type);
                gross_amount += vatAmount;
                const grand_total = gross_amount;
                // delete order items\
                yield restaurantOrderModel.deleteOrderItems({
                    order_id: Number(order_id),
                });
                yield restaurantOrderModel.updateOrder({
                    id: Number(order_id),
                    payload: {
                        staff_id: rest.staff_id,
                        order_type: rest.order_type,
                        guest_name: rest.guest_name,
                        table_id: rest.table_id,
                        sub_total: sub_total,
                        discount: (_g = rest.discount) !== null && _g !== void 0 ? _g : Number(existingOrder.discount),
                        discount_type: (_h = rest.discount_type) !== null && _h !== void 0 ? _h : existingOrder.discount_type,
                        service_charge: (_j = rest.service_charge) !== null && _j !== void 0 ? _j : Number(existingOrder.service_charge),
                        grand_total: grand_total,
                        service_charge_type: (_k = rest.service_charge_type) !== null && _k !== void 0 ? _k : existingOrder.service_charge_type,
                        vat: (_l = rest.vat) !== null && _l !== void 0 ? _l : Number(existingOrder.vat),
                        vat_type: (_m = rest.vat_type) !== null && _m !== void 0 ? _m : existingOrder.vat_type,
                        room_no: rest.room_no,
                        kitchen_status: rest.kitchen_status,
                        updated_by: id,
                    },
                });
                // delete existing order items
                if (order_items && order_items.length > 0) {
                    //  await Promise.all(
                    //    order_items.map(async (item) => {
                    //      const food = await restaurantFoodModel.getFoods({
                    //        id: item.food_id,
                    //        hotel_code,
                    //        restaurant_id,
                    //      });
                    //      await restaurantOrderModel.createOrderItems({
                    //        order_id: Number(order_id),
                    //        food_id: item.food_id,
                    //        name: food.data[0].name,
                    //        rate: Number(food.data[0].retail_price),
                    //        quantity: Number(item.quantity),
                    //        total:
                    //          Number(item.quantity) * Number(food.data[0].retail_price),
                    //      });
                    //    })
                    //  );
                    // order items payload then insert
                    const order_items_payload = order_items.map((item) => {
                        const food = foodItemsCopy.find((f) => f.id === item.food_id);
                        return {
                            order_id: Number(order_id),
                            food_id: item.food_id,
                            name: food === null || food === void 0 ? void 0 : food.name,
                            rate: Number(food === null || food === void 0 ? void 0 : food.retail_price) || 0,
                            quantity: Number(item.quantity),
                            total: Number(item.quantity) * (Number(food === null || food === void 0 ? void 0 : food.retail_price) || 0),
                        };
                    });
                    yield restaurantOrderModel.createOrderItems(order_items_payload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Order updated successfully.",
                };
            }));
        });
    }
}
exports.default = RestaurantOrderService;
//# sourceMappingURL=order.service.js.map